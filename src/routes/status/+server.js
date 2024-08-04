import getStatus from '$lib/getStatus.js';
import { json } from '@sveltejs/kit';
export async function GET() {
    try {
        return json({
            online: true,
            time: await getStatus()
        });
    }
    catch (e) {
        console.error(e);
        return json({
            online: false,
        });
        return new Response('offline', { status: 503 });
    }
}