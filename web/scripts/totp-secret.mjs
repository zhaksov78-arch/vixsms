// Prints a new ADMIN_TOTP_SECRET and the link to add it to Google Authenticator / 1Password.
import { randomBytes } from "crypto";
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const bytes = randomBytes(20);
let bits = "", secret = "";
for (const b of bytes) bits += b.toString(2).padStart(8, "0");
for (let i = 0; i < bits.length; i += 5) secret += A[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
console.log(`ADMIN_TOTP_SECRET="${secret}"`);
console.log(`otpauth://totp/Toi%20admin?secret=${secret}&issuer=Toi&digits=6&period=30`);
