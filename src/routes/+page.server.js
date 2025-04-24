/** @type {import('./$types').PageLoad} */
import { authentication, doubleauth, resolveqcm } from "$lib/functions/auth";
import generatelink from "$lib/functions/generatelink";
import { encrypt } from "$lib/functions/cryption.ts";
import { fail } from "@sveltejs/kit";
import { EMAIL_TO } from "$env/static/private";
import { env } from "$env/dynamic/private";
import sendEmail from "$lib/sendEmail.js";

export function load({ cookies }) {
  let loadData = new Object();
  let sessionCookie = cookies.get("sessionCookie");

  if (sessionCookie) {
    loadData = decodeCookie(sessionCookie);
    if (import.meta.env.DEV) {
      console.log(loadData);
    }
  }
  loadData.status = env.STATUS;
  return loadData;
}

export const actions = {
  connexion: async function ({ request, cookies }) {
    const data = await request.formData();
    try {
      let identifiant = data.get("login");
      let password = data.get("password");
      let fa = data.get("fa");
      const session = await authentication(identifiant, password, fa);
      if (session.code === 200) {
        const encryptedpassword = await encrypt(password);
        cookies.set(
          "sessionCookie",
          encodeCookie({
            step: "LINK",
            link: generatelink(
              identifiant,
              encryptedpassword.data,
              encryptedpassword.iv,
            ),
          }),
          {
            path: "/",
            maxAge: 1200,
          },
        );
      } else if (session.code === 250) {
        let qcm = await doubleauth(session.token);
        cookies.set(
          "sessionCookie",
          encodeCookie({
            step: "QCM",
            token: session.token,
            identifiant: identifiant,
            password: password,
            qcm: qcm,
          }),
          {
            path: "/",
            maxAge: 600,
          },
        );
      } else {
        throw new Error(session.message);
      }
    } catch (error) {
      console.error(error);
      return fail(422, {
        error: error.message.replace("Error:", "").trim(),
      });
    }
  },

  qcm: async function ({ url, request, cookies }) {
    const data = await request.formData();
    let sessionCookie = cookies.get("sessionCookie");
    sessionCookie = decodeCookie(sessionCookie);
    try {
      const resolvedqcm = await resolveqcm(
        sessionCookie.token,
        data.get("answer"),
      );
      if (resolvedqcm.code === 200) {
        var host;
        const fa = { cn: resolvedqcm.data.cn, cv: resolvedqcm.data.cv };
        const encryptedpassword = await encrypt(sessionCookie.password);
        if (import.meta.env.DEV) {
          host = url.host;
        }
        const link = generatelink(
          sessionCookie.identifiant,
          encryptedpassword.data,
          encryptedpassword.iv,
          fa,
          host,
        );
        cookies.set(
          "sessionCookie",
          encodeCookie({
            step: "LINK",
            link: link,
          }),
          {
            path: "/",
            maxAge: 1200,
          },
        );
      } else if (resolvedqcm.code === 500) {
        let qcm = await doubleauth(sessionCookie.token);
        cookies.set(
          "sessionCookie",
          encodeCookie({
            step: "QCM",
            token: sessionCookie.token,
            identifiant: sessionCookie.identifiant,
            password: sessionCookie.password,
            qcm: qcm,
          }),
          {
            path: "/",
            maxAge: 600,
          },
        );
      }

      // return await resolveQCM(sessionCookie.token, data.get("answer")).then(
      //   async (result) => {
      //     if (result.code === 500) {
      //       try {
      //         let qcm = await doubleauth(sessionCookie.token);
      //         sessionCookie.token = qcm.token;
      //         sessionCookie.question = qcm.question;
      //         sessionCookie.responses = qcm.propositions;
      //         cookies.set("sessionCookie", encodeCookie(sessionCookie), {
      //           path: "/",
      //           maxAge: 600,
      //         });
      //       } catch (error) {
      //         if (import.meta.env.DEV) {
      //           console.error(error);
      //         }
      //         return fail(422, {
      //           error: error.message.replace("Error:", "").trim(),
      //         });
      //       }
      //       return;
      //     }
      //     sessionCookie.link.cn = result.cn;
      //     sessionCookie.link.cv = result.cv;
      //     sessionCookie.link.host = url.host;
      //     let createdLink = createLink(sessionCookie.link);
      //     cookies.set(
      //       "sessionCookie",
      //       encodeCookie({
      //         step: "LINK",
      //         link: createdLink,
      //       }),
      //       {
      //         path: "/",
      //         maxAge: 600,
      //       },
      //     );
      //   },
      // );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      return fail(422, {
        error: error.message.replace("Error:", "").trim(),
      });
    }
  },

  contact: async function ({ url, request, cookies }) {
    let sessionCookie = cookies.get("sessionCookie");
    if (!sessionCookie) {
      sessionCookie = {};
    } else {
      sessionCookie = decodeCookie(sessionCookie);
    }
    const data = await request.formData();
    if (!data.get("message")) {
      return fail(422, {
        error: "Aucun message spécifié",
      });
    }
    let emailData = {
      from: `"Taquin - Contact" <contact@taquin.tech>`, // sender address
      to: EMAIL_TO, // list of receivers
      subject: "Contact request on taquin.tech", // Subject line
      html: `<p>${data.get("message")}</p><code>From: ${url.origin}</code><p>Reply to <a>${data.get("mail") ? data.get("mail") : ""}</a></p>`, // html body
    };
    //if (data.get('mail')) {
    //emailData.replyTo = data.get('mail')
    //}
    try {
      await sendEmail(emailData);
      sessionCookie.mail = true;
      cookies.set("sessionCookie", encodeCookie(sessionCookie), {
        path: "/",
        maxAge: 600,
      });
      return;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      return fail(422, {
        error: error.message.replace("Error:", "").trim(),
      });
    }
  },
};

function encodeCookie(cookie) {
  cookie = JSON.stringify(cookie);
  cookie = encodeURIComponent(cookie);
  return cookie;
}
function decodeCookie(cookie) {
  cookie = decodeURIComponent(cookie);
  cookie = JSON.parse(cookie);
  return cookie;
}
