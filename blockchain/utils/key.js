import { signMsg, verifyTransactionDoneByPubKey } from "../utils/crypto.js";

export class Key {
  constructor(_pvtKey, _pubKey = _pvtKey) {
    this.pvtKey = _pvtKey;
    this.pubKey = _pubKey;
  }

  getPvtKey() {
    return this.pvtKey;
  }

  getPubKey() {
    return this.pubKey;
  }

  setPvtKey(_pvtKey) {
    this.pvtKey = _pvtKey;
  }

  setPubKey(_pubKey) {
    this.pubKey = _pubKey;
  }
  toString() {
    return JSON.stringify({
      pvtKey: this.pvtKey,
      pubKey: this.pubKey,
    });
  }

  signMessage(_pvtKey, message) {
    // Implement signing logic here, e.g., using a cryptographic library
    // This is a placeholder for the actual signing implementation

    if (!_pvtKey || !message) {
      throw new Error("Private key and message are required for signing.");
    }
    if (_pvtKey !== this.pvtKey) {
      throw new Error(
        "Provided private key does not match the key stored in this instance."
      );
    }
    // return signMsg(_pvtKey, message);
    return signMsg(this.pubKey, message);
  }

  vefifySignature(transactionID, signature) {
    // Implement signature verification logic here, e.g., using a cryptographic library
    // This is a placeholder for the actual verification implementation

    if (!transactionID || !signature) {
      throw new Error(
        "Public key, message, and signature are required for verification."
      );
    }

    // return verifySignature(_pubKey, message, signature);
    return verifyTransactionDoneByPubKey(this.pubKey, message, signature);
  }
}
