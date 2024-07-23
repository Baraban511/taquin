import { DateTime } from "luxon";
export default async function getFeries() {
    let now = DateTime.now().setZone("Europe/Paris");
    let feries = await (await fetch(`https://openholidaysapi.org/PublicHolidays?countryIsoCode=FR&languageIsoCode=FR&validFrom=${now.toISODate()}&validTo=${now.plus({ years: 1 }).toISODate()}`)).json();
    let feriesDates = []
    for (let i = 0; i < feries.length; i++) {
        feriesDates[i] = await feries[i].startDate;
    }
    return { data : feries, dates: feriesDates };

}