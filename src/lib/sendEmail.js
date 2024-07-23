import { RESEND_KEY } from '$env/static/private';
import { Resend } from 'resend';

const resend = new Resend(RESEND_KEY);
// async..await is not allowed in global scope, must use a wrapper
export default async function sendEmail(mailData) {
    try {
        await resend.emails.send(mailData);
          
    }
    catch (error) {
        if (import.meta.env.DEV) {
            console.error(error);
        }
        throw new Error("Une erreur s'est produite lors de l'envoie du message.");
    }

}