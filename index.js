require("dotenv").config();
const fs = require("fs");
const server = require("./src/server");

const { PORT, NODE_ENV } = process.env;
//
// const PORT = 3000;
// const NODE_ENV = "Development";

server.listen(PORT, () => {
  console.log(`Express is running on port ${PORT} and use ${NODE_ENV} ENV`);
});
