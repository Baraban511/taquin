import { doubleauth } from "./connexion";
import { Buffer } from 'node:buffer';
export default async function resolveQCM(token, answer) {
    //Ajouter la gestion du code 500, mauvaise réponse au questionnaire
    if (!answer) {
        throw new Error ("Merci de séléectionner une réponse")
    }
    var answer = Buffer.from(answer).toString("base64");
    var body = "data=" + JSON.stringify({ choix: answer });
    return await fetch('https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=post&v=4.53.4', {
        method: 'POST',
        headers: {
            "Content-Type": "text/plain",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
            "x-token": token,
        },
        body: body
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Erreur http. Status :${response.status}`);
        }
        return response.json();
    }).then(async data => {
        if (data.code === 200) {
            return {
                step: "LINK",
                cn: data.data.cn,
                cv: data.data.cv,
            }
        }
        if (data.code === 500) {
            return {code : data.code};
        }
        else {
            throw new Error("Erreur " + data.message);
        }
    }).catch((error) => {
        throw new Error(error);
    });
}