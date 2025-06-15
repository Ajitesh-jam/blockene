//header of a block
import { NO_OF_TRANSACTIONS_IN_BLOCK } from "../constants/const.js";

export default class BlockHeader {
  // header of a block
  noOfTransactions;
  prevHash;
  nounce;

  constructor(
    _noOfTransactions = NO_OF_TRANSACTIONS_IN_BLOCK,
    _prevHash,
    _nounce
  ) {
    this.noOfTransactions = _noOfTransactions;
    this.prevHash = _prevHash;
    this.nounce = _nounce;
  }
  toString() {
    return JSON.stringify(this);
  }
  getNoOfTransactions() {
    return this.noOfTransactions;
  }
  getPrevHash() {
    return this.prevHash;
  }
  getNounce() {
    return this.nounce;
  }
  setNoOfTransactions(_noOfTransactions) {
    this.noOfTransactions = _noOfTransactions;
  }
}

export { BlockHeader };
export default BlockHeader;
export { BlockHeader as default } from "./blockHeader.js";
export { BlockHeader as BlockHeader } from "./blockHeader.js";
export { BlockHeader as BlockHeader } from "./blockHeader.js";
export { BlockHeader as BlockHeader } from "./blockHeader.js";
export { BlockHeader as BlockHeader } from "./blockHeader.js";
export { BlockHeader as BlockHeader } from "./blockHeader.js";