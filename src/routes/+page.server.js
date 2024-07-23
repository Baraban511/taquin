/** @type {import('./$types').PageLoad} */
import { connexion, doubleauth } from '$lib/connexion';
import resolveQCM from '$lib/resolveQCM';
import createLink from '$lib/createLink.js';
import sendEmail from '$lib/sendEmail.js'
import { fail } from '@sveltejs/kit';
import { EMAIL_TO } from '$env/static/private';

export function load({ cookies }, form) {
	let sessionCookie = cookies.get('sessionCookie');

	if (sessionCookie) {
		sessionCookie = decodeCookie(sessionCookie);
		if (import.meta.env.DEV) {
			console.log(sessionCookie);
		}
		return sessionCookie;

	}
}

export const actions = {
	connexion: async function ({ request, cookies }) {
		const data = await request.formData();
		try {
			return await connexion(data.get('login'), data.get('password')).then(connexion => {
				cookies.set('sessionCookie',
					encodeCookie({
						step: "QCM",
						token: connexion.token,
						link: connexion.link,
						question: connexion.qcm.question,
						responses: connexion.qcm.propositions
					}),
					{
						path: '/',
						maxAge: 600,
					});
			});
		}
		catch (error) {
			console.error(error);
			return fail(422, {
				error: error.message.replace('Error:', '').trim()
			});
		}
	},

	qcm: async function ({ url, request, cookies }) {
		const data = await request.formData();
		let sessionCookie = cookies.get('sessionCookie');
		sessionCookie = decodeCookie(sessionCookie);
		try {
			return await resolveQCM(sessionCookie.token, data.get('answer')).then(async result => {
				if (result.code === 500) {
					try {
						let qcm = await doubleauth(sessionCookie.token);
						sessionCookie.token = qcm.token;
						sessionCookie.question = qcm.question;
						sessionCookie.responses = qcm.propositions;
						cookies.set('sessionCookie',
							encodeCookie(sessionCookie),
							{
								path: '/',
								maxAge: 600,
							});
					}
					catch (error) {
						if (import.meta.env.DEV) {
							console.error(error);
						}
						return fail(422, {
							error: error.message.replace('Error:', '').trim()
						});
					}
					return;
				}
				sessionCookie.link.cn = result.cn;
				sessionCookie.link.cv = result.cv;
				sessionCookie.link.host = url.host;
				let createdLink = createLink(sessionCookie.link);
				cookies.set('sessionCookie',
					encodeCookie({
						step: "LINK",
						link: createdLink
					}),
					{
						path: '/',
						maxAge: 600
					});
			});
		}
		catch (error) {
			if (import.meta.env.DEV) {
				console.error(error);
			}
			return fail(422, {
				error: error.message.replace('Error:', '').trim()
			});
		}
	},

	contact: async function ({ url, request, cookies }) {
		let sessionCookie = cookies.get('sessionCookie');
		if (!sessionCookie) {
			sessionCookie = {};
		}
		else {
			sessionCookie = decodeCookie(sessionCookie);
		}
		const data = await request.formData();
		if (!data.get('message')) {
			return fail(422, {
				error: "Aucun message spécifié"
			});
		}
		let emailData = {
			from: `"Taquin - Contact" <contact@taquin.tech>`, // sender address
			to: EMAIL_TO, // list of receivers
			subject: "Contact request on taquin.tech", // Subject line
			html: `<p>${data.get('message')}</p><code>From: ${url.origin}</code><p>${data.get('mail') ? data.get('mail') : ''}</p>`, // html body
		}
		//if (data.get('mail')) {
		//emailData.replyTo = data.get('mail')
		//}
		try {
			await sendEmail(emailData)
			sessionCookie.mail = true;
			cookies.set('sessionCookie',
				encodeCookie(sessionCookie),
				{
					path: '/',
					maxAge: 600
				});
			return;
		}
		catch (error) {
			if (import.meta.env.DEV) {
				console.error(error);
			}
			return fail(422, {
				error: error.message.replace('Error:', '').trim()
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
	cookie = decodeURIComponent(cookie)
	cookie = JSON.parse(cookie)
	return cookie;
}