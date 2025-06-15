import sha256 from "crypto-js/sha256.js";

export function hash(data) {
  return sha256(data).toString();
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
