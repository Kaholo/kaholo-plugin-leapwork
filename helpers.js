const childProcess = require("child_process");
const { promisify } = require("util");

const execCommand = promisify(childProcess.exec);
const delay = (ms = 600000) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

module.exports = {
  delay,
  execCommand,
};
