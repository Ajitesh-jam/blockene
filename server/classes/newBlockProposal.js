import { Block, makeBlockFromData } from "../../blockchain/classes/block";
import { Transaction } from "../../blockchain/classes/transactions";
export class proposalClass {
  VRFValue;
  approverCitizen;
  block;
  signaturesOfWitnesses;
  constructor(VRFValue, approverCitizen, block) {
    if (block === undefined || !(block instanceof Block)) {
      throw new Error("Block must be an instance of Block class");
    }
    this.VRFValue = VRFValue;
    this.approverCitizen = approverCitizen;
    this.block = block; //instance of Block class
    this.signaturesOfWitnesses = [];
    this.signaturesOfWitnesses.push(approverCitizen);
  }
  addSignature(signature) {
    if (typeof signature !== "string") {
      throw new Error("Signature must be a string");
    }
    this.signaturesOfWitnesses.push(signature);
  }
  getSignatures() {
    return this.signaturesOfWitnesses;
  }
  getNumberOfSignatures() {
    return this.signaturesOfWitnesses.length;
  }
  getVRFValue() {
    return this.VRFValue;
  }
  getBlockHash() {
    return this.block.hash;
  }
}

export class NewBlockProposal {
  proposals; //array of proposal Class instances
  constructor() {
    this.proposals = [];
  }

  addProposal(VRFValue, approverCitizen, previousHash, nounce, transactions) {
    // make transactions instances of Transaction class if they are not already
    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error("Transactions must be a non-empty array");
    }
    transactions = transactions.map((tx) => {
      if (!(tx instanceof Transaction)) {
        return new Transaction(
          tx.id,
          tx.from,
          tx.to,
          tx.amount,
          tx.signature,
          tx.timestamp
        );
      }
      return tx;
    });

    // Validate the input data
    const newBlock = makeBlockFromData(
      transactions.length,
      previousHash,
      nounce,
      transactions
    );
    if (!newBlock) {
      return res.status(400).json({ message: "Invalid block data" });
    }
    // Validate the block
    if (!newBlock.verify()) {
      return res.status(400).json({ message: "Block verification failed" });
    }
    //if proposal is not empty check that the hash must match the hashes of block in the proposal and if its a unique VRFValue add it to the proposals
    if (this.proposals.length > 0) {
      const existingProposal = this.proposals.find(
        (proposal) => proposal.getVRFValue() === VRFValue
      );
      if (existingProposal) {
        console.log("Proposal with same VRFValue already exists");
        return;
      }
    }
    const proposal = new proposalClass(VRFValue, approverCitizen, newBlock);
    this.proposals.push(proposal);
    console.log("New proposal added:", proposal);
    return proposal;
  }

  getProposals() {
    return this.proposals;
  }

  clearProposals() {
    this.proposals = [];
  }
}
