import { decrypt } from '$lib/cryption.js';
import calendarError from '$lib/functions/calendarError.ts';
import getPublicHolidays from '$lib/getPublicHolidays.js';
import * as ics from 'ics'
import { DateTime } from "luxon";
import { redirect } from '@sveltejs/kit';
const zoneA = ["Besançon", "Bordeaux", "Clermont-Ferrand", "Dijon", "Grenoble", "Limoges", "Lyon", "Poitiers"];
const zoneB = ["Aix-Marseille", "Amiens", "Lille", "Nancy-Metz", "Nantes", "Nice", "Normandie", "Orléans-Tours", "Reims", "Rennes", "Strasbourg"];
const zoneC = ["Créteil", "Montpellier", "Paris", "Toulouse", "Versailles"];


export async function GET({ url }) {
	var events = []
	const publicHolidays = await getPublicHolidays();
	try {
		let password = url.searchParams.get('pass');
		let iv = url.searchParams.get('iv');
		let id = url.searchParams.get('id');
		let cn = decodeURIComponent(url.searchParams.get('cn'));
		let cv = decodeURIComponent(url.searchParams.get('cv'));
		if (!password || !cn || !cv || !id) {
			throw redirect(302, '/');
		}
		password = await decrypt(password, iv);
		let body =
			"data=" +
			JSON.stringify({
				identifiant: id,
				motdepasse: password,
				cn: cn,
				cv: cv
			});
		const login = await getLogin(body);
		events = events.concat(createPublicHolidaysEvents(publicHolidays));

		let timetable = await getTimetable(login);
		let timetableEvents = createTimetableEvents(timetable);
		events = events.concat(timetableEvents);
	}
	catch (error) {
		console.error(error);
		events = events.concat(calendarError(error));
	}
	finally {
		return new Response(createCalendar(events), {
			headers: {
				'Content-Type': 'ics'
			}
		});
	}
}

async function getLogin(body) {
	try {
		let response = await fetch('https://api.ecoledirecte.com/v3/login.awp?v=3', {
			method: 'POST',
			headers: {
				"Content-Type": "text/plain",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
			},
			body: body
		})
		response = await response.json();
		if (response.code !== 200) {
			if (response.code === 505) {
				throw new Error("Mot de passe incorrect", "Votre mot de passe est incorrect, vous pouvez actualiser votre lien ici : https://taquin.tech"
				);
			}
			throw new Error(response.message || "Erreur inconnue");
		}
		return {
			id: response.data.accounts[0].id,
			token: response.token,
			UAI: response.data.accounts[0].profile.rneEtablissement
		}
	}
	catch (e) {
		console.error(e);
		throw new Error(e);
	}
}
async function getTimetable(IdToken) {
	try {
		let now = DateTime.now().setZone("Europe/Paris");
		let body = "data=" + JSON.stringify({ "dateDebut": now.toISODate(), "dateFin": now.plus({ days: 10 }).toISODate() });
		let timetable = await fetch('https://api.ecoledirecte.com/v3/E/' + IdToken.id + '/emploidutemps.awp?verbe=get', {
			method: 'POST',
			headers: {
				"Content-Type": "text/plain",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
				"x-token": IdToken.token
			},
			body: body
		})
		timetable = await timetable.json();
		if (timetable.code !== 200) {
			if (timetable.code === 403) {
				return [];
			}
			console.error(timetable || "Erreur inconnue");
			throw new Error(timetable.message || "Erreur inconnue");
		}
		return timetable.data;
	}
	catch (e) {
		throw new Error(e);
	}
}

function createTimetableEvents(timetable) {
	let timetableEvents = []
	for (var i = 0; i < timetable.length; i++) {
		if (timetable[i].id == 0) {
			continue;
		}
		let status = "CONFIRMED";
		let busy = "BUSY";
		let alarm = [];
		let startDate = DateTime.fromISO(timetable[i].start_date.replace(" ", "T")).setZone("Europe/Paris").toUTC();
		// if (publicHolidays.dates.includes(startDate.toISODate())) {
		// 	continue;
		// }
		if (timetable[i].isAnnule) {
			status = "CANCELLED";
			busy = "FREE";
			alarm.push({ action: 'display', description: 'Cours annule', trigger: { hours: 1, before: true } });
		}
		let endDate = DateTime.fromISO(timetable[i].end_date.replace(" ", "T")).setZone("Europe/Paris").toUTC();
		timetableEvents.push(
			{
				title: timetable[i].text,
				start: [startDate.year, startDate.month, startDate.day, startDate.hour, startDate.minute],
				startInputType: 'utc',
				startOutputType: 'local',
				end: [endDate.year, endDate.month, endDate.day, endDate.hour, endDate.minute],
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
				alarms: alarm
			}
		);
	}
	return timetableEvents;
}
function createPublicHolidaysEvents(publicHolidays) {
	var publicHolidaysEvent = []
	for (var i = 0; i < publicHolidays.data.length; i++) {
		if (publicHolidays.data[i].nationwide === false) {
			continue;
		}
		let startDate = DateTime.fromISO(publicHolidays.data[i].startDate).setZone("Europe/Paris");
		let endDate = startDate.plus({ day: 1 });
		publicHolidaysEvent.push({
			title: publicHolidays.data[i].name[0].text,
			start: [startDate.year, startDate.month, startDate.day],
			end: [endDate.year, endDate.month, endDate.day],
			description: `Pas de cours !`,
			categories: ["ferie"],
			status: "CONFIRMED",
			calName: "Emploi du temps",
		});
	}
	return publicHolidaysEvent;
}

function createCalendar(events) {
	var calendar = ics.createEvents(events, (error, value) => {
		if (error) {
			throw new Error(error);
		}
		return value;
	})
	let lines = calendar.split('\n');
	lines.splice(6, 0, 'X-WR-TIMEZONE:Europe/Paris \n X-WR-CALDESC:Emploi du temps');
	calendar = lines.join('\n');
	return calendar;
}

function getHomeworks(IdToken) {
	let now = DateTime.now().setZone("Europe/Paris");
	let headers = {
		"Content-Type": "text/plain",
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
		"x-token": IdToken.token
	};

	const homeworks1 = fetch(`https://api.ecoledirecte.com/v3/Eleves/${IdToken.id}/cahierdetexte/${now.toISODate()}.awp`, {
		headers,
	}).then(response => response.json());
	const homeworks2 = fetch(`https://api.ecoledirecte.com/v3/Eleves/${IdToken.id}/cahierdetexte/${now.plus({ day: 1 }).toISODate()}.awp`, {
		headers,
	}).then(response => response.json());
	Promise.all([homeworks1, homeworks2])
		.then(([homeworks1, homeworks2]) => {
			return {
				homeworks1,
				homeworks2
			}
		})
		.catch(error => {
			console.error(error);
		});
}
/**
 * Fetches the holiday data for a given educational institution based on its UAI code.
 *
 * @param {string} codeUAI - The UAI code of the educational institution.
 * @returns {Promise<string|null>} A promise that resolves to the holiday data as a string, or null if the institution's academy is not found in any zone.
 *
 * @example
 * getHolidays('1234567A').then(holidays => {
 *   console.log(holidays);
 * });
 */
async function getHolidays(codeUAI) {
	var lycee = await (await fetch(`https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records?lang=fr&where=identifiant_de_l_etablissement%20LIKE%20'${codeUAI}'`)).json();
	console.log(lycee.libelle_academie);
	if (zoneA.includes(lycee.libelle_academie)) {
		let holidays = await (await fetch("https://www.data.gouv.fr/fr/datasets/r/ee16d126-af0f-4b3b-84d3-080ef8bc0abd")).text();
		console.log(holidays);
		holidays = concatenateHolidays(holidays);
		return holidays;
	}
	if (zoneB.includes(lycee.libelle_academie)) {
		let holidays = await (await fetch("https://www.data.gouv.fr/fr/datasets/r/c03b7373-6698-4e44-b5f1-9408b4b2cfe8")).text();
		holidays = concatenateHolidays(holidays);
		return holidays;
	}
	if (zoneC.includes(lycee.libelle_academie)) {
		let holidays = await (await fetch("https://www.data.gouv.fr/fr/datasets/r/c594ee20-e694-4f30-810d-752acdf69d70")).text();
		holidays = concatenateHolidays(holidays);
		return holidays;
	}
	else {
		return false;
	}
}

function concatenateHolidays(holidays) {
	let index = holidays.indexOf("BEGIN:VEVENT");
	holidays = holidays.substring(index + substring.length);
	let lastIndex = holidays.lastIndexOf("END:VEVENT");
	holidays = holidays.substring(0, lastIndex + "END:VEVENT".length);
	return holidays;
}