'use strict';
const config = require('./config');
var promise = require('bluebird');
var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var db=pgp(process.env.DATABASE_URL);


module.exports = function(projetID,fonctionID){
    console.log(fonctionID)
    db.any(`SELECT personne FROM projet WHERE projet='${projetID}' AND fonction='${fonctionID}'`)
        .then(data => {
            console.log(data[0].personne);
            return data;
        })
        .catch(error =>{
            console.log('ERROR1:', error);
        });
}