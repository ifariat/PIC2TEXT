const fs = require('fs');
const db = require('../controllers/dataBase.js');
const errorsList = require('./errorsList.js');

module.exports = {
  setDownloadPath: async () => {
    let stmt = "SELECT * FROM ??";
    let result = await db.queryDB(stmt, [process.env.TABLE_NAME]);
      return new Promise((resolve,reject) => {
      resolve(JSON.parse(JSON.stringify(result[0]["countId"])));
    })
  },
  incrementId: id => {
    let stmt = "UPDATE ?? SET countId = ?";
    let newId = id + 1;
    let result = db.queryDB(stmt, [process.env.TABLE_NAME, newId]);
  },
  generate: async function (base64Image, convertedText) {
    let id = await this.setDownloadPath();
    return await new Promise((resolve,reject) => {
      this.incrementId(id);
      let errors = [];
      let bufferData = Buffer.from(base64Image, "base64");
      let imagePath = `./public/download/image_generated_by_pic2text${id}.jpg`;
      let textPath = `./public/download/text_generated_by_pic2text${id}.txt`;

      fs.writeFile(imagePath, bufferData, 'binary', err => {
        if (err) errors.push("There was an error writing the image");
      });

      fs.writeFile(textPath, convertedText, function (err) {
        if (err) errors.push("There was an error writing the text");
      });

      if (!errors.length) {
        resolve({
          imagePath,
          textPath
        });
      } else {
        reject(errorsList.disk);
      };
    })
  }
}