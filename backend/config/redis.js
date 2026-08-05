
const { createClient } = require("@redis/client");
const client = createClient({
    url: 'redis://localhost:6379'
});
client.on('error', err => console.log('Redis Client Error', err));

// Enable Redis if scaling beyond single server
const redisEnabled = process.env.REDIS_ENABLED
// const redisEnabled = true
let otps = {};
let otpExpiry = {};

if (redisEnabled) {
    client.connect()
}

async function setOTP(number, otp, expires) {

    if (redisEnabled) {
        await client.set(number, JSON.stringify(otp), { EX: expires, NX: true })

    } else {
        otps[number] = otp
        otpExpiry[number] = Date.now() + (expires * 1000)
        return Promise.resolve()
    }

}

async function getOTP(number) {
    if (redisEnabled)
        return JSON.parse(await client.get(number))
    else {
        if (otpExpiry[number] && Date.now() < otpExpiry[number]) {
            return Promise.resolve(otps[number])
        }
        return Promise.resolve(null)
    }
}

async function deleteOTP(number) {
    if (redisEnabled)
        return await client.del(number)
    else {
        delete otps[number]
        delete otpExpiry[number]
        return Promise.resolve()
    }
}

module.exports = {
    setOTP,
    getOTP,
    deleteOTP
}

