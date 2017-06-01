'use strict';
const config = require('./config');
var promise = require('bluebird');
var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var db=pgp(process.env.DATABASE_URL);


module.exports = class select{
    function getPersonne(projetID,fonctionID){
        console.log(fonctionID);
        return new Promise(function(resolve, reject){
            db.any(`SELECT personne FROM projet WHERE projet='${projetID}' AND fonction='${fonctionID}'`)
                .then(data => {
                    console.log(data[0].personne);
                    res=data[0].personne;
                    console.log("res "+res);
                    resolve(res);
                })
                .catch(error =>{
                    console.log('ERROR1:', error);
                });
        });
    }
}