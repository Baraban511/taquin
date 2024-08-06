import { decrypt } from '$lib/cryption.js';
import calendarError from '$lib/functions/calendarError.ts';
import getPublicHolidays from '$lib/getPublicHolidays.js';
import * as ics from 'ics'
import { DateTime } from "luxon";

export async function GET({ url }) {
	var events = []
	const publicHolidays = await getPublicHolidays();
	try {
		let password = await decrypt(url.searchParams.get('pass'), url.searchParams.get('iv'));
		let login = url.searchParams.get('id');
		let cn = decodeURIComponent(url.searchParams.get('cn'));
		let cv = decodeURIComponent(url.searchParams.get('cv'));
		if (!password || !cn || !cv || !login) {
			throw new Error({ name: "Paramètres manquants", message: "Votre lien à été modifié. Vous pouvez le regénerer ici : https://taquin.tech" });
		}
		let body =
			"data=" +
			JSON.stringify({
				identifiant: login,
				motdepasse: password,
				cn: cn,
				cv: cv
			});
		events = events.concat(createPublicHolidaysEvents(publicHolidays));

		let EDT = await getEDT(await getIdToken(body), publicHolidays);
		events = events.concat(createEDTEvents(EDT));
	}
	catch (error) {
		console.error(error);
		events = events.concat(calendarError(error));
	}
	finally {
		console.log(events)
		return new Response(createCalendar(events), {
			headers: {
				'Content-Type': 'ics'
			}
		});
	}
}

async function getIdToken(body) {
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
			token: response.token
		}
	}
	catch (e) {
		console.error(e);
		throw new Error(e);
	}
}
async function getEDT(IdToken) {
	try {
		let now = DateTime.now().setZone("Europe/Paris");
		let body = "data=" + JSON.stringify({ "dateDebut": now.toISODate(), "dateFin": now.plus({ days: 10 }).toISODate() });
		let response = await fetch('https://api.ecoledirecte.com/v3/E/' + IdToken.id + '/emploidutemps.awp?verbe=get', {
			method: 'POST',
			headers: {
				"Content-Type": "text/plain",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
				"x-token": IdToken.token
			},
			body: body
		})
		response = await response.json();
		if (response.code !== 200) {
			console.error(response || "Erreur inconnue");
			throw new Error(response.message || "Erreur inconnue");
		}
		return response;
	}
	catch (e) {
		throw new Error(e);
	}
}

function createEDTEvents(EDT, publicHolidays) {
	let EDTEvents = []
	for (var i = 0; i < EDT.length; i++) {
		if (EDT[i].id == 0) {
			continue;
		}
		let status = "CONFIRMED";
		let busy = "BUSY";
		let alarm = [];
		let startDate = DateTime.fromISO(EDT[i].start_date.replace(" ", "T")).setZone("Europe/Paris");
		if (publicHolidays.dates.includes(startDate.toISODate())) {
			continue;
		}
		if (EDT[i].isAnnule) {
			status = "CANCELLED";
			busy = "FREE";
			alarm.push({ action: 'display', description: 'Cours annule', trigger: { hours: 1, before: true } });
		}
		let endDate = DateTime.fromISO(EDT[i].end_date.replace(" ", "T")).setZone("Europe/Paris");
		EDTEvents.push(
			{
				title: EDT[i].text,
				start: [startDate.year, startDate.month, startDate.day, startDate.hour, startDate.minute],
				startOutputType: 'local',
				end: [endDate.year, endDate.month, endDate.day, endDate.hour, endDate.minute],
				description: `Avec ${EDT[i].prof} en salle ${EDT[i].salle}`,
				location: EDT[i].salle,
				categories: [
					"cours",
					EDT[i].matiere,
					EDT[i].prof,
					EDT[i].salle,
					status,
				],
				status: status,
				busyStatus: busy,
				calName: "Emploi du temps",
				alarms: alarm
			}
		);
	}
	return EDTEvents;
}
function createPublicHolidaysEvents(publicHolidays) {
	var publicHolidaysEvent = []
	for (var i = 0; i < publicHolidays.data.length; i++) {
		let startDate = DateTime.fromISO(publicHolidays.data[i].startDate).setZone("Europe/Paris");
		let endDate = startDate.plus({ day: 1 });
		publicHolidaysEvent.push({
			title: publicHolidays.data[0].name[0].text,
			start: [startDate.year, startDate.month, startDate.day],
			end: [endDate.year, endDate.month, endDate.day],
			description: `Pas de cours !\n${publicHolidays.data[i].nationwide ? "Pour tout le monde" : "Pas pour tous !"}`,
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
	lines.splice(6, 0, 'X-WR-TIMEZONE:Europe/Paris');
	calendar = lines.join('\n');
	return calendar;
}