/** @type {import('@sveltejs/kit').Handle} */
import { env } from "$env/dynamic/private";
export async function handle({ event, resolve }) {
  if (env.STATUS === "offline") {
    if (event.url.pathname === "/api") {
      return new Response(
        "EcoleDirecte is currently offline. We can't handle your request",
        { status: 503 },
      );
    }
    if (event.request.method === "POST") {
      return new Response(
        "EcoleDirecte is currently offline. We can't handle your request",
        { status: 503 },
      );
    } else {
      return await resolve(event);
    }
  }
  const response = await resolve(event);
  return response;
}
