const secureRandom = async (count) => { 
    // generate a cryptographically secure integer
    
    let cryptoObj = window.crypto;
    let rand = new Uint32Array(1)
    let skip = 0x7fffffff - 0x7fffffff % count
    let result: number;

    if (((count - 1) & count) === 0) {
        cryptoObj.getRandomValues(rand)
        return rand[0] & (count - 1)
    }

    do {
        cryptoObj.getRandomValues(rand)
        result = rand[0] & 0x7fffffff
    } while (result >= skip)

    return result % count
}

export default secureRandom;