import { SECRET_KEY } from '$env/static/private';
import { Buffer } from 'node:buffer';
const crypto = globalThis.crypto;

async function getKey() {
    // Convert the secret key to an ArrayBuffer
    const enc = new TextEncoder();
    const keyData = enc.encode(SECRET_KEY);

    // Import the key
    return crypto.subtle.importKey(
        'raw',
        keyData,
        'AES-CBC',
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encrypt(data) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const key = await getKey();

    // Encode the data as an ArrayBuffer
    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv: iv
        },
        key,
        encodedData
    );

    return {
        data: Buffer.from(new Uint8Array(encryptedData)).toString('hex'),
        iv: Buffer.from(iv).toString('hex')
    };
}

export async function decrypt(data, iv) {
    const key = await getKey();

    // Convert data and iv from hex to ArrayBuffer
    const encryptedData = new Uint8Array(Buffer.from(data, 'hex'));
    const ivArray = new Uint8Array(Buffer.from(iv, 'hex'));

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
        {
            name: 'AES-CBC',
            iv: ivArray
        },
        key,
        encryptedData
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedData);
}
