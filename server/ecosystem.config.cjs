 


// const { PORT1 } = require("../constants/const");
// const { PORT2 } = require("../constants/const");
// const { PORT3 } = require("../constants/const");
// const { PORT4 } = require("../constants/const");

module.exports = {
  apps: [
    {
      name: "server1",
      script: "server.js",
      env: { PORT: 4000 }
    },
    {
      name: "server2",
      script: "server.js",
      env: { PORT: 4001 }
    },
    {
      name: "server3",
      script: "server.js",
      env: { PORT: 6000 }
    },
    {
      name: "server4",
      script: "server.js",
      env: { PORT: 7001 }
    }
  ]
};
