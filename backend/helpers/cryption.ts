import { encrypt } from '@metamask/eth-sig-util';

export function encryptData(data: string, pKey: string) {
  const encryptedData = encrypt({
    data: data,
    publicKey: pKey,
    version: "x25519-xsalsa20-poly1305",
  });
  return encryptedData;
}

type EncryptionBody = {
  data: string,
  pKey: string,
  version?: string | null | undefined,
};

export function encryptDataB(o: EncryptionBody) {
  const encryptedData = encrypt({
    data: o.data,
    publicKey: o.pKey,
    version: o.version || "x25519-xsalsa20-poly1305",
  });
  return encryptedData;
}
