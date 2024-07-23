import * as cheerio from 'cheerio';
export default async function getStatus() {
    try {
        const response = await fetch('https://status.ecoledirecte.com/');
        const text = await response.text();
        const $ = cheerio.load(text);
        const titles = [];

        $('li span.status').each((index, element) => {
            const title = $(element).attr('title');
            titles.push(title);
        });

        var apiTime = titles[1];
        apiTime = apiTime.replace(/\D/g, "");
        return apiTime;
    }
    catch (e) {
        console.error(e);
        throw new Error(e);
    }
}