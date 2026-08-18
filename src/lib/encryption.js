import nacl from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';

const PRIVATE_KEY_STORAGE = 'cohort_private_key';

export function ensureKeyPair() {
  const existingPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE);
  if (existingPrivateKey) return { privateKey: existingPrivateKey, publicKey: null };

  const keyPair = nacl.box.keyPair();
  const privateKey = encodeBase64(keyPair.secretKey);
  const publicKey = encodeBase64(keyPair.publicKey);
  localStorage.setItem(PRIVATE_KEY_STORAGE, privateKey);
  return { privateKey, publicKey };
}

export function encryptMessage(content, recipientPublicKey, senderPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE)) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box(decodeUTF8(content), nonce, decodeBase64(recipientPublicKey), decodeBase64(senderPrivateKey));
  return {
    encrypted_content: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

export function decryptMessage(encryptedContent, nonce, senderPublicKey, recipientPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE)) {
  const decrypted = nacl.box.open(decodeBase64(encryptedContent), decodeBase64(nonce), decodeBase64(senderPublicKey), decodeBase64(recipientPrivateKey));
  return decrypted ? encodeUTF8(decrypted) : null;
}
