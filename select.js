'use strict';
//const request = require('request');
const config = require('./config');
const pg = require('pg');
pg.defaults.ssl = true;

module.exports = function(callback,fonctionID){
            if (!fonctionID) {

                pg.connect(process.env.DATABASE_URL, function (err, client) {
                    if (err) throw err;
                    let results=[];
                    client
                        .query(`SELECT personne FROM projet WHERE fonction='${fonctionID}'`)
                        .on('row',function (row) {
                            text1=results.push(row);
                            console.log(results);
                        })
                    callback(fonctionID);
                    console.log("resulta "+results);
                });
            }else {
                console.error('error');
            }
}