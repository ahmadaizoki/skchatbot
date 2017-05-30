'use strict';
//const request = require('request');
const config = require('./config');
const pg = require('pg');
var promise = require('bluebird');

pg.defaults.ssl = true;
var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require('pg-promise')(options);


module.exports = function(fonctionID){
           /* if (!fonctionID) {
                var per=fonctionID;

                pg.connect(process.env.DATABASE_URL, function (err, client) {
                    if (err) throw err;
                    let results=[];
                    client
                        .query(`SELECT personne FROM projet WHERE fonction='${fonctionID}'`)
                        .on('row',function (row) {
                            text1=results.push(row);
                            console.log(results);
                        });
                    console.log("resulta "+results);
                })
                callback(select);
            }else {
                console.error('error');
            }*/
    var db = pgp(process.env.DATABASE_URL);

    function getPersonne(req, res, next) {
        db.any('SELECT personne FROM projet WHERE fonction='${fonctionID}'')
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Retrieved Personne'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }



}