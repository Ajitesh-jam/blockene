import sha256 from "crypto-js/sha256.js";

export function hash(data) {
  return sha256(data).toString();
}
export function signMsg(pvtKey, data) {
  //should be like i sign message with a pvt key and get a signature
  //anyone can verify it like on passing on some function my public key and message ,
  //it should return true if signature is valid

  //to demonstrate ,for now we will just assume pvtKey=pubkey and hash the public key + data

  return hash(pvtKey + data); //for now it will be public key
}
export function verifySignature(pubKey, message, signature) {
  const expectedSignature = hash(pubKey + message);
  if (expectedSignature === signature) return true;
  else return false;
}
export function verifyTransactionDoneByPubKey(
  pubKey,
  transactionID,
  signature
) {
  // const expectedSignature = hash(pubKey + transactionID);
  // if (expectedSignature === signature) return true;
  // else return false;
  return verifySignature(pubKey, transactionID, signature);
}

export function buildMerkleTree(leaves) {
  if (leaves.length === 0) return hash(""); // edge case

  // If odd number of leaves, duplicate last
  if (leaves.length % 2 !== 0) {
    leaves.push(leaves[leaves.length - 1]);
  }

  while (leaves.length > 1) {
    const newLevel = [];

    for (let i = 0; i < leaves.length; i += 2) {
      const combined = leaves[i] + leaves[i + 1];
      newLevel.push(hash(combined));
    }

    // If odd again in new level, duplicate last
    if (newLevel.length % 2 !== 0 && newLevel.length !== 1) {
      newLevel.push(newLevel[newLevel.length - 1]);
    }

    leaves = newLevel;
  }

  return leaves[0];
}

export function VRFGenerate(pvt_key, message) {
  const proof = hash(pvt_key + message); // simulate HMAC using simple concat
  const randomValue = hash(proof); // hash of proof = random output
  return { randomValue, proof };
}

export function VRFVerify(pub_key, message, randomValue, proof) {
  const recalculatedProof = hash(pub_key + message);
  if (recalculatedProof !== proof) return false;

  const recalculatedRandom = hash(proof);
  return recalculatedRandom === randomValue;
}

export function giveLowHash(hash1, hash2) {
  // Compare two hashes and return the one that is lexicographically smaller
  return hash1 > hash2 ? true : false;
}
