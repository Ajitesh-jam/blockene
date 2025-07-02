import express from "express";
import {
  addBlockToBlockchain,
  addNewBlockPropposal,
  addSignatureToProposal,
  getNewBlockProposals,
  getAllBlocks,
  getBlockByIndex,
  getLatestBlock,
  getLatestHash,
  getNBlocks,
  replaceChain,
} from "../controllers/blockController.js";

const router = express.Router();

// router.post("/blocks", addBlock); // /api/blocks
router.get("/blocks", getAllBlocks); //   /api/blocks
router.get("/blocks/:index", getBlockByIndex); // /api/blocks/:index
router.get("/blocks/latest", getLatestBlock); // /api/blocks/latest
router.get("/blocks/latest/hash", getLatestHash); // /api/blocks/latest/hash
router.get("/blocks/last/:n", getNBlocks); // /api/blocks/last/:n
router.post("/blocks/replace", replaceChain); // /api/blocks/replace

//add routes for witness list
// router.post("/witnessList", addWitnessList); // /api/witnessList
// router.get("/witnessList", getWitnessList); // /api/witnessList give all witness lists in politician
// router.get("/witnessList/:ApproverCitizenid", getWitnessListByApproverID); // approverCitizen ki id waali list
// router.get("/witnessList/txPool/:txId", getWitnessListByTxId); // /api/witnessList/txPool/:txId -> get all transactions in all witness lists

//add delete route for witness list
// router.delete("/witnessList/:ApproverCitizenid", deleteWitnessList); // /api/witnessList/:ApproverCitizenid -> delete witness list by approverCitizen id

router.post("/addNewProposal", addNewBlockPropposal); // /api/addBlockToProposals
router.post("/addBlockToBlockchain", addBlockToBlockchain); // /api/addBlockToBlockchain
router.post("/addSignatureToProposal", addSignatureToProposal); // /api/addSignatureToProposal
router.get("/getNewBlockProposals", getNewBlockProposals); // /api/getNewBlockProposals

export default router;
