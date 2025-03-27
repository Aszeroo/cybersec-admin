const CryptoJS = require("crypto-js");

const myPass = 'mypass';
const myKey = 'dogcatcow';


//encode
const encode = CryptoJS.AES.encrypt(myPass, myKey);
console.log('encode: ', encode.toString());


//decode
const decode = CryptoJS.AES.decrypt(encode.toString() , myKey);
console.log('decode: ', decode.toString(CryptoJS.enc.Utf8));