export const uint8ArrayToBase64 = (buf: Uint8Array) => {
    let binstr = Array.prototype.map
        .call(buf, function (ch: number) {
            return String.fromCharCode(ch);
        })
        .join("");
    return btoa(binstr);
};

export const base64ToUint8Array = (base64: string) => {
    let binstr = atob(base64);
    let buf = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(
        binstr,
        function (ch: string, i: string | number) {
            buf[i] = ch.charCodeAt(0);
        }
    );
    return buf;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
    

export const base64ToArrayBuffer = (buffer: string) => {
    return Uint8Array.from(atob(buffer), c => c.charCodeAt(0));
}