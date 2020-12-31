const mysql = require('mysql');
const errorsList = require('./errorsList.js');

module.exports = {
    connect: () => {
        return new Promise((resolve, reject) => {
            let db = mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PW,
                database: process.env.DB_NAME
            })
            db.connect(function (err) {
                if (err) reject(errorsList.network);
                resolve(db);
            })
        })
    },
    queryDB: async function(stmt, placeHolder) {
        const con = await this.connect();
        return new Promise((resolve, reject) => {
            con.query(stmt, placeHolder, (error, results, fields) => {
                if (error) reject(errorsList.network);
                resolve(results);
            });
        });
    }
};
