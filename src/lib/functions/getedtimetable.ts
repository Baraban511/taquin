import { DateTime } from "luxon";
import { headers } from "$lib/functions/auth";
import { API_VERSION } from "$env/static/private";
export default async function getEdTimetable(
  identifier: string,
  token: string,
) {
  const now = DateTime.now().setZone("Europe/Paris");
  const body =
    "data=" +
    JSON.stringify({
      dateDebut: now.toISODate(),
      dateFin: now.plus({ days: 10 }).toISODate(),
    });
  const request = new Request(
    "https://api.ecoledirecte.com/v3/E/" +
      identifier +
      "/emploidutemps.awp?verbe=get&v=" +
      API_VERSION,
    {
      method: "POST",
      headers: headers,
      body: body,
    },
  );
  request.headers.set("x-token", token);
  const response = await fetch(request);
  const timetable = await response.json();
  if (timetable.code !== 200) {
    if (timetable.code === 403) {
      return [];
    }
    console.error(timetable || "Erreur inconnue");
    throw new Error(timetable.message || "Erreur inconnue");
  }
  return timetable.data;
}
