import { DateTime } from "luxon";

export default function eventError(error?: Error) {
  let errorStartDate = DateTime.now().setZone("Europe/Paris");
  let errorEndDate = errorStartDate.plus({ day: 1 });
  return {
    title: error?.name || "Erreur",
    start: [errorStartDate.year, errorStartDate.month, errorStartDate.day],
    end: [errorEndDate.year, errorEndDate.month, errorEndDate.day],
    description: `Impossible de générer l'emploi du temps : ${error?.message || "Erreur inconnue"}`,
    calName: "Emploi du temps",
    busy: "free",
    productId: "-//taquin.barab.me",
  };
}
