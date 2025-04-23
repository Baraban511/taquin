import { API_VERSION } from "$env/static/private";
import { USER_AGENT } from "$env/static/private";

export const headers = new Headers({
  "Content-Type": "text/plain",
  "User-Agent": USER_AGENT,
});

export async function authentication(
  login: string,
  password: string,
  fa?: [{ cn: string; cv: string }],
) {
  let gtk: string | undefined;
  let cookies: Array<string>;
  {
    const request = await fetch(
      "https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=" + API_VERSION,
      {
        headers: headers,
      },
    );
    cookies = request.headers.getSetCookie();
    for (const cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === "GTK") gtk = value;
    }

    const match = gtk?.match(/^[^;]*/);

    if (match) {
      gtk = match[0];
    }
  }
  let body =
    "data=" +
    JSON.stringify({
      identifiant: login,
      motdepasse: encodeURIComponent(password),
      isReLogin: false,
      fa: fa ? fa : [],
    });
  const request = new Request(
    "https://api.ecoledirecte.com/v3/login.awp?v=" + API_VERSION,
    {
      method: "POST",
      headers: headers,
      body: body,
    },
  );
  request.headers.set("Cookie", cookies.join("; "));
  gtk ? request.headers.set("X-GTK", gtk) : "";
  return await fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur http. Status :${response.status}`);
      }
      return response.json();
    })
    .then(async (data) => {
      let login: {
        code: number;
        message: string;
        token: string;
        identifier?: string;
      } = {
        code: data.code,
        message: data.message,
        token: data.token,
      };
      data.code === 200 ? (login.identifier = data.data.accounts[0].id) : "";
      return login;
    })
    .catch((error) => {
      throw new Error(error);
    });
}

export async function doubleauth(token: string) {
  const request = new Request(
    "https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=get&v=" +
      API_VERSION,
    {
      method: "POST",
      headers: headers,
      body: "data={}",
    },
  );
  request.headers.set("x-token", token);
  return await fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur http. Status :${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.code != 200) {
        throw new Error(data.message);
      }
      const qcm = {
        question: decodeBase64(data.data.question), // Décodage Base64 avec support UTF-8
        answers: Array<string>(),
      };
      for (let i = 0; i < data.data.propositions.length; i++) {
        const proposition = decodeBase64(data.data.propositions[i]); // Décodage Base64 avec support UTF-8
        qcm.answers.push(proposition);
      }
      return qcm;
    })
    .catch((error) => {
      throw new Error(error);
    });
}

export async function resolveqcm(token: string, answer: string) {
  if (!answer) {
    throw new Error("Merci de sélectionner une réponse");
  }
  const encodedAnswer = encodeBase64(answer); // Encodage Base64 avec support UTF-8
  const request = new Request(
    "https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=post&v=" +
      API_VERSION,
    {
      method: "POST",
      headers: headers,
      body: "data=" + JSON.stringify({ choix: encodedAnswer }),
    },
  );
  request.headers.set("x-token", token);
  return await fetch(request)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Status :${response.status}`);
      }
      return response.json();
    })
    .then(async (data) => {
      return {
        code: data.code,
        data: data.data,
      };
    })
    .catch((error) => {
      throw new Error(error);
    });
}
// Fonction pour encoder en Base64 avec support des caractères non-ASCII
function encodeBase64(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input); // Convertit la chaîne en UTF-8
  const base64String = btoa(String.fromCharCode(...utf8Bytes)); // Encode en Base64
  return base64String;
}

// Fonction pour décoder depuis Base64 avec support des caractères non-ASCII
function decodeBase64(input: string): string {
  const binaryString = atob(input); // Décodage Base64
  const utf8Bytes = new Uint8Array(
    [...binaryString].map((char) => char.charCodeAt(0)),
  ); // Convertit en tableau d'octets
  const decodedString = new TextDecoder().decode(utf8Bytes); // Convertit en chaîne UTF-8
  return decodedString;
}
