import * as ics from "ics";
export default function generateTimetable(events) {
  var calendar: string = ics.createEvents(events, (error, value) => {
    if (error) {
      throw new Error(error.message);
    }
    return value;
  });
  let lines: Array<string> = calendar.split("\n");
  lines.splice(6, 0, "X-WR-TIMEZONE:Europe/Paris");
  calendar = lines.join("\n");
  return calendar;
}
