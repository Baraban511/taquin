import { env } from '$env/dynamic/private';
import getStatus from "$lib/getStatus.js";
export default async function updateStatus() {
    try {
        await getStatus();
        env.STATUS = "online";
    } catch (e) {
        console.error(e);
        env.STATUS = "offline";
    }
}
//Execute at every request to the server