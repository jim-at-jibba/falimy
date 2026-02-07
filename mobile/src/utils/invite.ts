const ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";

const randomString = (length: number): string => {
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return output;
};

export const generateInviteCode = (): string => randomString(8);

export const generateTopicPrefix = (): string => `fam_${randomString(6)}`;
