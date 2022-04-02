import eff from "../assets/eff";
import secureRandom from "./random";

export const getDicewareWords = async (length: number, addMoreEntropy: boolean = true) => {
    // get the random words from the dice ware dict
    let wordslist = [];
    for (let i = 0; i < length; i++) {
        let newnum = [];
        for (let j = 0; j < 5; j += 1) {
            // roll a 6 sided die
            newnum.push((await secureRandom(6)) + 1);
        }
        let theword = eff[newnum.join("")];
        wordslist.push(theword.charAt(0).toUpperCase() + theword.slice(1));
    }
    let separator: string = addMoreEntropy ? "_" : "";
    wordslist.splice(await secureRandom(length + 1), 0, separator);
    return wordslist.join("");
};

export const scorePassword = async (pass: string) => {
    let score: string = "0";
    if (!pass) return 0;

    // award every unique letter until 5 repetitions
    let letters = Object();
    for (let i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    let letiations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    };

    let letiationCount = 0;
    for (let check in letiations) {
        letiationCount += letiations[check] === true ? 1 : 0;
    }
    score += (letiationCount - 1) * 10;

    return Number(score);
};
