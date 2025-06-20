// utils/consensus.js

const axios = require("axios");
const {
  getBlockchain,
  setBlockchain,
  isValidChain,
} = require("../controllers/blockController");

const peerPorts = [4000, 5000, 6000, 7001]; //abhi ports theek hai but aagey jaake yeh IPS hojayegey ti code uss hisab se likhna padega
//maaney sirf ports me fetch mat karr...pura pura IP address le lo

async function fetchPeerChains(myPort) {
  const chains = [];

  for (const port of peerPorts) {
    if (port === myPort) continue;
    try {
      const res = await axios.get(`http://localhost:${port}/api/blocks`); //issey ip address karna ..naaki localhost
      chains.push(res.data);
    } catch {
      console.warn(`⚠️ Peer ${port} unreachable`);
    }
  }

  return chains;
}

function findConsensusChain(peerChains) {
  const countMap = {};
  let maxChain = null;
  let maxVotes = 0;

  for (const chain of peerChains) {
    const key = JSON.stringify(chain);
    countMap[key] = (countMap[key] || 0) + 1;

    if (
      countMap[key] > maxVotes ||
      (countMap[key] === maxVotes &&
        (!maxChain || chain.length > maxChain.length))
    ) {
      maxVotes = countMap[key];
      maxChain = chain;
    }
  }

  return maxChain;
}

async function syncConsensus(myPort) {
  const peerChains = await fetchPeerChains(myPort);
  const validChains = peerChains.filter(isValidChain);
  const consensusChain = findConsensusChain(validChains);

  if (consensusChain && consensusChain.length > getBlockchain().length) {
    setBlockchain(consensusChain);
    console.log("Synced with consensus chain.");
  } else {
    console.log("No valid longer consensus chain found.");
  }
}

module.exports = {
  syncConsensus,
};
