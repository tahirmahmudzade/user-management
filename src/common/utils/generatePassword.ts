import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export const generatePassword = async (password: string) => {
  const salt = randomBytes(8).toString('hex');
  const hash = await passwordHash(password, salt);

  return `${salt}.${hash.toString('hex')}`;
};

export const passwordHash = async (password: string, salt: string) => {
  const hash = (await scrypt(password, salt, 32)) as Buffer;

  return hash;
};
