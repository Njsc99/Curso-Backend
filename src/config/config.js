const path = require('path');

module.exports = {
    PORT: 8080,
    getFilePath: (fileName) => path.join(__dirname, `../data/${fileName}`)
};