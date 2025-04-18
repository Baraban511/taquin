export async function connexionED(login: string, password: string) {
    var password = encodeURIComponent(password);
    const GTK_feth = await fetch("https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=4.77.5")
    console.log(GTK_feth.headers.getSetCookie());
    const regex = /^[a-zA-Z0-9=]+(?=[^a-zA-Z0-9=])/;
    const cookie = GTK_feth.headers.getSetCookie()[0];
    console.log(cookie);
    const GTK = cookie.match(regex)?.[0];
    const body =
        "data=" +
        JSON.stringify({
            identifiant: login,
            motdepasse: password,
        });
    const headers = new Headers({
        "Content-Type": "text/plain",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
        ...(GTK ? { "X-GTK": GTK } : {}),
    });
    console.log(headers);
    return await fetch('https://api.ecoledirecte.com/v3/login.awp?v=4.78.0', {
        method: 'POST',
        headers: headers,
        body: body
    }).then(response => {
        console.log(response);
        if (!response.ok) {
            throw new Error(`Erreur http. Status :${response.status}`);
        }
        return response.json();
    }).then(async data => {
        console.log(data);
    }).catch((error) => {
        throw new Error(error);
    });
};
connexionED("barab.", "Akina&511")