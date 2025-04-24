import { DateTime } from "luxon";
export default async function getPublicHolidays() {
  let now = DateTime.now().setZone("Europe/Paris");
  let publicHolidays = await (
    await fetch(
      `https://openholidaysapi.org/PublicHolidays?countryIsoCode=FR&languageIsoCode=FR&validFrom=${now.toISODate()}&validTo=${now.plus({ years: 1 }).toISODate()}`,
    )
  ).json();
  let publicHolidaysDates = [];
  for (let i = 0; i < publicHolidays.length; i++) {
    publicHolidaysDates[i] = await publicHolidays[i].startDate;
  }
  var publicHolidaysEvents = [];
  for (var i = 0; i < publicHolidays.length; i++) {
    if (publicHolidays[i].nationwide === false) {
      continue;
    }
    let startDate = DateTime.fromISO(publicHolidays[i].startDate).setZone(
      "Europe/Paris",
    );
    let endDate = startDate.plus({ day: 1 });
    publicHolidaysEvents.push({
      title: publicHolidays[i].name[0].text,
      start: [startDate.year, startDate.month, startDate.day],
      end: [endDate.year, endDate.month, endDate.day],
      description: `Pas de cours !`,
      categories: ["ferie"],
      status: "CONFIRMED",
      calName: "Emploi du temps",
    });
  }
  return publicHolidaysEvents;
}
