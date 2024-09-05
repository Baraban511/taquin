import { DateTime } from "luxon";
export default function calendarError(error: { name: string; message: string; }) {
let errorStartDate = DateTime.now().setZone('Europe/Paris');
let errorEndDate = errorStartDate.plus({day: 1});
    return {
        title: error.name || "Erreur",
        start: [errorStartDate.year, errorStartDate.month, errorStartDate.day],
        end: [errorEndDate.year, errorEndDate.month, errorEndDate.day],
        description: `Il semblerait qu'on ait un problème : ${error.message}`,
        calName: "Emploi du temps",
        busy: 'free',
    };
}