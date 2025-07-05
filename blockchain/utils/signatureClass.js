import { signMsg, verifySignature } from "./crypto";

export class signatureClass {
  signature; //signature is a string
  citizen; //citizen is a string
  constructor(signature, citizen) {
    if (typeof signature !== "string" || typeof citizen !== "string") {
      // throw new Error("Signature and citizen must be strings");
    }
    this.signature = signature;
    this.citizen = citizen; //public key of the citizen
  }
  getSignature() {
    return this.signature;
  }
  getCitizen() {
    return this.citizen;
  }
  toString() {
    return JSON.stringify({
      signature: this.signature,
      citizen: this.citizen,
    });
  }
  signMessage(_pvtKey, message) {
    // Implement signing logic here, e.g., using a cryptographic library
    // This is a placeholder for the actual signing implementation

    if (!_pvtKey || !message) {
      throw new Error("Private key and message are required for signing.");
    }
    if (_pvtKey !== this.citizen) {
      throw new Error(
        "Provided private key does not match the citizen stored in this instance."
      );
    }
    return signMsg(this.citizen, message);
  }
  verifySignature(msg) {
    if (!msg || !this.signature) {
      throw new Error(
        "Public key, message, and signature are required for verification."
      );
    }
    return verifySignature(this.citizen, transactionID, this.signature);
  }
  equals(otherSignature) {
    if (!(otherSignature instanceof signatureClass)) {
      otherSignature = new signatureClass(
        otherSignature.signature,
        otherSignature.citizen
      );
    }
    return (
      this.signature === otherSignature.getSignature() &&
      this.citizen === otherSignature.getCitizen()
    );
  }
}
