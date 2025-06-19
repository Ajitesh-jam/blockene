class MinimalState {
  constructor(latestBlockHash, merkleRootHash, userList = []) {
    this.latestBlockHash = latestBlockHash;
    this.merkleRootHash = merkleRootHash;
    this.userList = userList;
  }

  updateState(newBlockHash, newMerkleRootHash, newUserList) {
    this.latestBlockHash = newBlockHash;
    this.merkleRootHash = newMerkleRootHash;
    if (newUserList) this.userList = newUserList;
  }

  isEqual(otherState) {
    return (
      this.latestBlockHash === otherState.latestBlockHash &&
      this.merkleRootHash === otherState.merkleRootHash &&
      JSON.stringify(this.userList) === JSON.stringify(otherState.userList)
    );
  }
}

export class Citizen {
  constructor(id, publicKey, initialState) {
    this.id = id;
    this.publicKey = publicKey;
    this.state = initialState; // MinimalState instance
  }

  getState() {
    return this.state;
  }

  receiveStateUpdate(newState) {
    if (newState instanceof MinimalState) {
      this.state.updateState(
        newState.latestBlockHash,
        newState.merkleRootHash,
        newState.userList
      );
    } else {
      throw new Error("Invalid state format");
    }
  }

  queryBlockchain(queryFunction) {
    console.log(`Citizen ${this.id} is querying the blockchain.`);
    return queryFunction(this.state);
  }

  proposeUpdate(updateFunction) {
    console.log(`Citizen ${this.id} is proposing an update.`);
    return updateFunction(this.state);
  }
}

// Export MinimalState class
export { MinimalState };
// Export Citizen class
export default Citizen;