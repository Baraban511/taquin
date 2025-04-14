import { encrypt } from "./cryption";
import { Buffer } from "node:buffer";
export async function connexion(login, password) {
  if (password === "" || login === "") {
    throw new Error("Identifiant ou mot de passe vide");
  }
  var password = encodeURIComponent(password);
  var body =
    "data=" +
    JSON.stringify({
      identifiant: login,
      motdepasse: password,
      isReLogin: false,
      uuid: "",
      fa: [],
    });
  console.log(body);
  return await fetch("https://api.ecoledirecte.com/v3/login.awp?v=4.77.5", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    },
    body: body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur http. Status :${response.status}`);
      }
      return response.json();
    })
    .then(async (data) => {
      console.log(data);
      if (data.code === 200) {
        throw new Error(
          "Votre compte EcoleDirecte ne prend pas en charge EDC pour l'instant",
        );
      }
      if (data.code === 250) {
        var link = {
          password: await encrypt(password),
          login: login,
        };
        return {
          step: "QCM",
          token: data.token,
          qcm: await doubleauth(data.token),
          link: link,
        };
      }
      if (data.code === 505) {
        throw new Error(data.message);
      } else {
        return data.code;
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
}

export async function doubleauth(token) {
  return await fetch(
    "https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=get",
    {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
        "x-token": token,
      },
      body: "data={}",
    },
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur http. Status :${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.code == 200) {
        var qcm = {
          token: token,
          question: Buffer.from(data.data.question, "base64").toString("utf-8"),
          propositions: [],
        };
        for (let i = 0; i < data.data.propositions.length; i++) {
          let proposition = Buffer.from(
            data.data.propositions[i],
            "base64",
          ).toString("utf-8");
          qcm.propositions.push(proposition);
        }
        return qcm;
      } else {
        throw new Error(data.data.message);
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
}
