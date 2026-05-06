require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function test() {
  try {
    const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({to: '+916267787442', channel: 'sms'});
    console.log("Success! Status:", verification.status);
    console.log(verification);
  } catch (e) {
    console.error("Twilio Error:");
    console.error(e.message);
    if (e.code) console.error("Code:", e.code);
  }
}
test();
