import jsonfile from 'jsonfile';
import sha256 from 'sha256';
import CryptoJS from 'crypto-js';

const input = jsonfile.readFileSync('data.json');

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}


function combinate<O extends Record<string | number, any[]>>(obj: O) {
    let combos: { [k in keyof O]: O[k][number] }[] = [];
    for (const key of Object.keys(obj)) {
        const values = obj[key];
        const all = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < (combos.length || 1); j++) {
                if (key == 'destination' && combos[j]?.origin != undefined && combos[j].origin == values[i]) {
                    continue
                }
                const newCombo = { ...combos[j], [key]: values[i] };
                all.push(newCombo);
            }
        }
        combos = all;
    }
    return combos;
}

const cfg = {
    name: input.names,
    origin: input.cities,
    destination: input.cities
}

// let count = getRandomIntInclusive(49, 499);
let count = getRandomIntInclusive(1, 2);

const output = combinate(cfg);

const batch = [];
let payload = '';

const PASSPHRASE = 'testing';
// const CORRUPTPHRASE = 'corrupt';

while (count--) {
    const item: any = output.splice(Math.floor(Math.random() * output.length), 1)[0];
    item.secret_key = sha256(JSON.stringify(item));
    // item.secret_key = sha256(JSON.stringify(item) + (count % 5) ? CORRUPTPHRASE : '');
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(item), PASSPHRASE).toString();
    // const encrypted = CryptoJS.AES.encrypt(JSON.stringify(item) + (count % 7) ? CORRUPTPHRASE : '', PASSPHRASE).toString();
    batch.push(item);
    payload += encrypted + '|';
}

const ENCDATA = payload.split('|').filter(item => item);
for (const d of ENCDATA) {
    const bytes = CryptoJS.AES.decrypt(d, PASSPHRASE);
    let item;
    try {
        item = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        // tslint:disable-next-line: no-console
        console.log('malformed');
        continue
    }
    const SECRETKEY = item.secret_key;
    Reflect.deleteProperty(item, 'secret_key');
    const CNFSECRETKEY = sha256(JSON.stringify(item));
    if (SECRETKEY != CNFSECRETKEY) {
        // tslint:disable-next-line: no-console
        console.log('mismatch');
    } else {
        // tslint:disable-next-line: no-console
        console.log('match');
    }
}
