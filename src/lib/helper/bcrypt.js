const { hashSync, compareSync } = require("bcryptjs");

const saltRounds = 6;

export async function hashPassword(plainPassword) {
  const hashedPass = hashSync(plainPassword, saltRounds);
  return hashedPass;
}
export async function verifyPassword(plainPassword, encryptedPass) {
  const result = compareSync(plainPassword, encryptedPass);
  return result;
}
