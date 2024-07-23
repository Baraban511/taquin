/** @type {import('@sveltejs/kit').Handle} */
import { env } from '$env/dynamic/private';
import updateStatus from "$lib/updateStatus.js";
import { json } from '@sveltejs/kit';
export async function handle({ event, resolve }) {
	updateStatus();
	if (env.STATUS === "offline") {
		if (event.url.pathname === "/api") {
			return new Response("EcoleDirecte is currently offline. We can't handle your request", { status: 503 });
		}
		if (event.url.pathname === "/status") {
			return json({
				online: false,
			});
		}
		if (event.request.method === "POST") {
			return new Response("EcoleDirecte is currently offline. We can't handle your request", { status: 503 });
		}
		else { return await resolve(event); }
	};
	const response = await resolve(event);
	return response;
}