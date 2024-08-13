export default function createLink(link) {
    let cv = encodeURIComponent(link.cv);
    let cn = encodeURIComponent(link.cn);
    var password = encodeURIComponent(link.password.data);
    var iv = encodeURIComponent(link.password.iv);
    var host = 'taquin-4i2.pages.dev';
    var id = encodeURIComponent(link.login);
    if (import.meta.env.DEV) {
        host = link.host;
    }
    return (`${host}/api?cv=${cv}&cn=${cn}&iv=${iv}&pass=${password}&id=${id}`)
}