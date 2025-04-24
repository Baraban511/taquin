import { authentication, headers } from "$lib/functions/auth";
import { decrypt } from "$lib/functions/cryption";
import getEdTimetable from "$lib/functions/getedtimetable";
import getPublicHolidays from "$lib/functions/getpublicholidays";
import generateTimetable from "$lib/functions/generatetimetable";
import eventError from "$lib/functions/eventerror";
import { DateTime } from "luxon";
import { redirect } from "@sveltejs/kit";

export async function GET({ url }) {
  var events: Array<any> = [];
  try {
    let identifiant: string = url.searchParams.get("id");
    let password: string = url.searchParams.get("pass");
    let iv: string = url.searchParams.get("iv");
    let cn: string | undefined = decodeURIComponent(url.searchParams.get("cn"));
    let cv: string | undefined = decodeURIComponent(url.searchParams.get("cv"));
    if (!password || !iv || !identifiant) {
      throw redirect(302, "/");
    }
    password = await decrypt(password, iv);
    const auth =
      cn && cv
        ? await authentication(identifiant, password, [{ cn: cn, cv: cv }])
        : await authentication(identifiant, password);
    if (auth.code !== 200) {
      if (auth.code === 505) {
        throw new Error("Mot de passe incorrect");
      } else if (auth.code === 250) {
        throw new Error("QCM non complété");
      }
    }
    const edEvents = createTimetableEvents(
      await getEdTimetable(auth.identifier, auth.token),
    );
    events = events.concat(edEvents);
    events = events.concat(await getPublicHolidays());
  } catch (error) {
    console.error(error);
    events = events.concat(eventError(error));
  } finally {
    const timetable = generateTimetable(events);
    return new Response(timetable, {
      headers: {
        "Content-Type": "ics",
      },
    });
  }
}

function createTimetableEvents(timetable: Array<any>) {
  let timetableEvents = [];
  for (var i = 0; i < timetable.length; i++) {
    if (timetable[i].id == 0) {
      continue;
    }
    let status = "CONFIRMED";
    let busy = "BUSY";
    let alarm = [];
    let startDate = DateTime.fromISO(timetable[i].start_date.replace(" ", "T"))
      .setZone("Europe/Paris")
      .toUTC();
    // if (publicHolidays.dates.includes(startDate.toISODate())) {
    // 	continue;
    // }
    if (timetable[i].isAnnule) {
      status = "CANCELLED";
      busy = "FREE";
      alarm.push({
        action: "display",
        description: "Cours annulé",
        trigger: { hours: 1, before: true },
      });
    }
    let endDate = DateTime.fromISO(timetable[i].end_date.replace(" ", "T"))
      .setZone("Europe/Paris")
      .toUTC();
    timetableEvents.push({
      title: timetable[i].text,
      start: [
        startDate.year,
        startDate.month,
        startDate.day,
        startDate.hour,
        startDate.minute,
      ],
      startInputType: "utc",
      startOutputType: "local",
      end: [
        endDate.year,
        endDate.month,
        endDate.day,
        endDate.hour,
        endDate.minute,
      ],
      description: `Avec ${timetable[i].prof} en salle ${timetable[i].salle}`,
      location: timetable[i].salle,
      categories: [
        "cours",
        timetable[i].matiere,
        timetable[i].prof,
        timetable[i].salle,
        status,
      ],
      status: status,
      busyStatus: busy,
      calName: "Emploi du temps",
      alarms: alarm,
    });
  }
  return timetableEvents;
}

function getHomeworks(id: string, token: string) {
  let now = DateTime.now().setZone("Europe/Paris");
  let headers = {
    "Content-Type": "text/plain",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "x-token": token,
  };

  const homeworks1 = fetch(
    `https://api.ecoledirecte.com/v3/Eleves/${id}/cahierdetexte/${now.toISODate()}.awp`,
    {
      headers,
    },
  ).then((response) => response.json());
  const homeworks2 = fetch(
    `https://api.ecoledirecte.com/v3/Eleves/${id}/cahierdetexte/${now.plus({ day: 1 }).toISODate()}.awp`,
    {
      headers,
    },
  ).then((response) => response.json());
  Promise.all([homeworks1, homeworks2])
    .then(([homeworks1, homeworks2]) => {
      return {
        homeworks1,
        homeworks2,
      };
    })
    .catch((error) => {
      console.error(error);
    });
}
