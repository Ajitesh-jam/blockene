import { BlockHeader } from "../../blockchain/classes/blockHeader.js";
import { BlockData } from "../../blockchain/classes/blockData.js";
import { Block, makeBlockFromData } from "../../blockchain/classes/block.js";
import { Transaction } from "../../blockchain/classes/transactions.js";
import { THRESHOLD_CONSENSUS_FOR_BLOCK_FINALITY } from "../../constants/const.js";
import { VRFVerify } from "../../blockchain/utils/crypto.js";
import { verifySignature } from "../../blockchain/utils/crypto.js";
import { makeBlockFromTransactions } from "../../blockchain/core/blockMethods.js";
import { signatureClass } from "../../blockchain/utils/signatureClass.js";

export class proposalClass {
  VRFValue; // VRFValue is a string
  VRFProof;
  approverCitizen;
  block;
  signaturesOfWitnesses;
  constructor(VRFValue, VRFProof, approverCitizen, block, signature) {
    if (block === undefined || !(block instanceof Block)) {
      throw new Error("Block must be an instance of Block class");
    }
    if (!verifySignature(approverCitizen, block.getBlock(), signature)) {
      throw new Error("VRFProof verification failed");
    }
    this.VRFValue = VRFValue;
    this.VRFProof = VRFProof;
    this.approverCitizen = approverCitizen;
    this.block = block; //instance of Block class
    this.signaturesOfWitnesses = [];
    const signatureInstance = new signatureClass(signature, approverCitizen);

    this.signaturesOfWitnesses.push(signatureInstance);
  }
  addSignature(signature) {
    if (!(signature instanceof signatureClass)) {
      throw new Error("Signature must be an instance of signatureClass");
    }

    this.signaturesOfWitnesses.push(signature);
    return this; // return the updated proposal
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
  getBlock() {
    return this.block;
  }
}

export class NewBlockProposal {
  proposals; //array of proposal Class instances
  GotVRFValues; //array of VRFValues that have been used in proposals
  constructor() {
    this.proposals = [];
    this.GotVRFValues = []; //to keep track of VRFValues that have been used in proposals
  }

  addProposal(
    VRFValue,
    VRFProof,
    approverCitizen,
    previousHash,
    nounce,
    transactions,
    signature
  ) {
    // make transactions instances of Transaction class if they are not already
    if (this.GotVRFValues.includes(VRFValue)) {
      console.log("VRFValue already used in a proposal:", VRFValue);
      return null; // VRFValue already used in a proposal
    }

    const newBlock = makeBlockFromTransactions(
      previousHash,
      nounce,
      transactions
    );

    if (!VRFVerify(approverCitizen, newBlock.getBlock(), VRFValue, VRFProof)) {
      new Error("VRFValue verification failed");
      return null; // VRFValue verification failed
    }
    if (!newBlock) {
      return res.status(400).json({ message: "Invalid block data" });
    }
    // Validate the block
    if (!newBlock.verify()) {
      return res.status(400).json({ message: "Block verification failed" });
    }
    const proposal = new proposalClass(
      VRFValue,
      VRFProof,
      approverCitizen,
      newBlock,
      signature
    );

    this.GotVRFValues.push(VRFValue); // add VRFValue to the list of used VRFValues
    //better to add in sorted order but for now just push it
    this.proposals.push(proposal);
    return proposal;
  }

  addSignatureToProposal(block, approverCitizen, signature) {
    //if block is not instance of Block class make it an instance of Block class
    if (!(block instanceof Block)) {
      block = makeBlockFromTransactions(
        block.header.prevHash,
        block.header.nounce,
        block.data.transactions
      );
      block.verify();
      if (!verifySignature(approverCitizen, block.getBlock(), signature)) {
        console.log("Signature verification failed for block:", block);
        throw new Error("signature verification failed");
      }
    }
    // Find the proposal with the matching block hash
    const proposal = this.getProposalByBlockHash(block.hash);
    if (!proposal) {
      return null; // No proposal found for the given block hash
    }
    // Check if the signature already exists for the proposal
    const existingSignature = proposal
      .getSignatures()
      .find((sig) => sig.getCitizen() === approverCitizen);
    if (existingSignature) {
      return null; // Signature already exists for the citizen
    }
    // Create a new signature instance and add it to the proposal
    const newSignature = new signatureClass(signature, approverCitizen);
    proposal.addSignature(newSignature);
    return proposal; // Return the updated proposal
  }

  getProposals() {
    return this.proposals;
  }

  getProposalByVRFValue(VRFValue) {
    return this.proposals.find(
      (proposal) => proposal.getVRFValue() === VRFValue
    );
  }

  getProposalByBlockHash(blockHash) {
    return this.proposals.find(
      (proposal) => proposal.getBlockHash() === blockHash
    );
  }

  getLowestVRFValueProposal() {
    if (this.proposals.length === 0) {
      console.log("No proposals available to find the lowest VRF value.");
      return null; // No proposals available
    }
    return this.proposals.reduce((lowest, current) => {
      return lowest.getVRFValue() < current.getVRFValue() ? lowest : current;
    });
  }

  clearProposals() {
    delete this.proposals;
    delete this.GotVRFValues;

    // Reinitialize the arrays
    this.GotVRFValues = [];
    this.proposals = [];
  }

  getMaxSignatureProposal() {
    if (this.proposals.length === 0) {
      console.log(
        "No proposals available to find the block with maximum signatures."
      );
      return null; // No proposals available
    }
    return this.proposals.reduce((max, current) => {
      return max.getNumberOfSignatures() > current.getNumberOfSignatures()
        ? max
        : current;
    });
  }

  checkForBlockFinality() {
    // Check if there is a proposal with enough signatures for block finality
    const maxSignatureProposal = this.getMaxSignatureProposal();
    if (maxSignatureProposal === null) {
      console.log("No proposals available to check for block finality.");
      return null; // No proposals available
    } else if (
      maxSignatureProposal.getNumberOfSignatures() >
      THRESHOLD_CONSENSUS_FOR_BLOCK_FINALITY
    ) {
      // Clear the proposals after adding the block to the blockchain
      this.clearProposals();
      return maxSignatureProposal;
    } else {
      console.log(
        "Block finality not achieved. Max signatures:",
        maxSignatureProposal.getNumberOfSignatures(),
        " Threshold:",
        THRESHOLD_CONSENSUS_FOR_BLOCK_FINALITY
      );
      return null; // Block finality not achieved
    }
  }
}
