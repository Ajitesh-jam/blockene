
import express from "express";
import { addBlock, getAllBlocks, getBlockByIndex, getLatestBlock,
  getLatestHash,
  getNBlocks, replaceChain} from "../controllers/blockController.js";

const router = express.Router();

router.post("/blocks", addBlock); // /api/blocks
router.get("/blocks", getAllBlocks);    //   /api/blocks
router.get("/blocks/:index", getBlockByIndex); // /api/blocks/:index
router.get("/blocks/latest", getLatestBlock); // /api/blocks/latest
router.get("/blocks/latest/hash", getLatestHash); // /api/blocks/latest/hash
router.get("/blocks/last/:n", getNBlocks); // /api/blocks/last/:n
router.post("/blocks/replace", replaceChain); // /api/blocks/replace


export default router;
