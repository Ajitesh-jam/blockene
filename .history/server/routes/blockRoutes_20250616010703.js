
import express from "express";
import { addBlock, getAllBlocks, getBlockByIndex } from "../controllers/blockController.js";

const router = express.Router();

router.post("/blocks", addBlock); // /api/blocks
router.get("/blocks", getAllBlocks);    //   /api/blocks
router.get("/blocks/:index", getBlockByIndex); // /api/blocks/:index

export default router;
