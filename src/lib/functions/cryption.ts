import { SECRET_KEY } from "$env/static/private";

const crypto = globalThis.crypto;

export async function encrypt(data: string) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await getKey();

  // Encode the data as an ArrayBuffer
  const enc = new TextEncoder();
  const encodedData = enc.encode(data);

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    encodedData,
  );

  return {
    data: arrayBufferToHex(encryptedData),
    iv: arrayBufferToHex(iv),
  };
}

export async function decrypt(data: string, iv: string) {
  const key = await getKey();

  // Convert data and iv from hex to ArrayBuffer
  const encryptedData = hexToArrayBuffer(data);
  const ivArray = hexToArrayBuffer(iv);

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: ivArray,
    },
    key,
    encryptedData,
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedData);
}

async function getKey() {
  // Convert the secret key to an ArrayBuffer
  const enc = new TextEncoder();
  const keyData = enc.encode(SECRET_KEY);

  // Import the key
  return crypto.subtle.importKey("raw", keyData, "AES-CBC", false, [
    "encrypt",
    "decrypt",
  ]);
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const byteArray = new Uint8Array(
    hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
  );
  return byteArray.buffer;
}
