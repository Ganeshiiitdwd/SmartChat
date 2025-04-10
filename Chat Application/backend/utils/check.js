import Cryptr from 'cryptr'

const cryptr=new Cryptr('myTotallySecretKey', { encoding: 'base64', pbkdf2Iterations: 10000, saltLength: 10 })

const encryptedstring= cryptr.encrypt('ganesh')
const decryptedstring=cryptr.decrypt(encryptedstring)

console.log(encryptedstring)
console.log(decryptedstring)