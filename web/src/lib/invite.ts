const ALPHANUM = 'abcdefghijklmnopqrstuvwxyz0123456789'

const randomString = async (length: number): Promise<string> => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => ALPHANUM[b % ALPHANUM.length])
    .join('')
}

export const generateInviteCode = async (): Promise<string> => randomString(8)

export const generateTopicPrefix = async (): Promise<string> => `fam_${await randomString(6)}`
