import { decrypt } from '$lib/cryption.js';
import getFeries from '$lib/getFeries.js';
import * as ics from 'ics'
import { DateTime } from "luxon";

export async function GET({ url }) {
	const password = await decrypt(url.searchParams.get('pass'), url.searchParams.get('iv'));
	var cn = decodeURIComponent(url.searchParams.get('cn'));
	var cv = decodeURIComponent(url.searchParams.get('cv'));
	const login = url.searchParams.get('id');
	if (!password || !cn || !cv || !login) {
		return new Response("Paramètres manquants", {
			status: 400
		});
	}
	var body =
		"data=" +
		JSON.stringify({
			identifiant: login,
			motdepasse: password,
			cn: cn,
			cv: cv
		});
	return await fetch('https://api.ecoledirecte.com/v3/login.awp?v=3', {
		method: 'POST',
		headers: {
			"Content-Type": "text/plain",
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
		},
		body: body
	}).then(response => {
		return response.json();
	}).then(async data => {
		if (data.code !== 200) {
			throw new Error(data.message || "Erreur inconnue");
		}
		var token = data.token; var id = data.data.accounts[0].id;

		var now = DateTime.now().setZone("Europe/Paris");
		var body = "data=" + JSON.stringify({ "dateDebut": now.toISODate(), "dateFin": now.plus({ days: 10 }).toISODate() });
		return await fetch('https://api.ecoledirecte.com/v3/E/' + id + '/emploidutemps.awp?verbe=get', {
			method: 'POST',
			headers: {
				"Content-Type": "text/plain",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
				"x-token": token
			},
			body: body
		}).then(response => {
			return response.json();
		}).then(async data => {
			if (!data) {
				throw new Error("Erreur inconnue");
			}
			if (data.code !== 200) {
				console.error(data.message || "Erreur inconnue");
				console.log(data);
			}
			var calendar = [];
			const feries = await getFeries();
			for (var i = 0; i < data.length; i++) {
				if (data[i].id == 0) {
					continue;
				}
				let status = "CONFIRMED";
				let busy = "BUSY";
				let alarm = [];
				let startDate = DateTime.fromISO(data[i].start_date.replace(" ", "T")).setZone("Europe/Paris");
				if (feries.dates.includes(startDate.toISODate())) {
					continue;
				}
				if (data[i].isAnnule) {
					status = "CANCELLED";
					busy = "FREE";
					alarm.push({ action: 'display', description: 'Cours annule', trigger: { hours: 1, before: true } });
				}
				let endDate = DateTime.fromISO(data[i].end_date.replace(" ", "T")).setZone("Europe/Paris");
				calendar.push({
					title: data[i].text,
					start: [startDate.year, startDate.month, startDate.day, startDate.hour, startDate.minute],
					startOutputType: 'local',
					end: [endDate.year, endDate.month, endDate.day, endDate.hour, endDate.minute],
					description: `Avec ${data[i].prof} en salle ${data[i].salle}`,
					location: data[i].salle,
					categories: [
						"cours",
						data[i].matiere,
						data[i].prof,
						data[i].salle,
						status,
					],
					status: status,
					busyStatus: busy,
					calName: "Emploi du temps",
					alarms: alarm
				});
			}
			for (var i = 0; i < feries.data.length; i++) {
				let startDate = DateTime.fromISO(feries.data[i].startDate).setZone("Europe/Paris");
				let endDate = startDate.plus({ day: 1 });
				calendar.push({
					title: feries.data[i].name.text,
					start: [startDate.year, startDate.month, startDate.day],
					end: [endDate.year, endDate.month, endDate.day],
					description: `Pas de cours ! \n ${feries.data[i].nationwide ? "Pour tout le monde" : "Pas pour tous !"}`,
					categories: ["ferie"],
					status: "CONFIRMED",
					calName: "Emploi du temps",
				});
			}
			return ics.createEvents(calendar, (error, value) => {
				if (error) {
					console.error(error);
					throw new Error(error);
					// return new Response(error, {
					// 	status: 500
					// });
					//Faire retour evenement erreur
				}
				let lines = value.split('\n');
				lines.splice(6, 0, 'X-WR-TIMEZONE:Europe/Paris');
				value = lines.join('\n');
				return new Response(value, {
					headers: {
						'Content-Type': 'ics'
					}
				});
			})
		});
	}).catch(error => {
		console.error(error);
		return new Response(error, {
			status: 500
		});
	});
}