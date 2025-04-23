export default function generateLink(
  identifiant: string,
  password: string,
  iv: string,
  fa: { cv: string; cn: string } | undefined,
  host = "taquin.barab.me",
) {
  identifiant = encodeURIComponent(identifiant);
  password = encodeURIComponent(password);
  iv = encodeURIComponent(iv);
  let cv = fa ? encodeURIComponent(fa.cv) : "";
  let cn = fa ? encodeURIComponent(fa.cn) : "";
  return `${host}/api?id=${identifiant}&pass=${password}&iv=${iv}${cv ? "&cv=" + cv : ""}${cn ? "&cn=" + cn : ""}`;
}
