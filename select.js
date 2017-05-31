'use strict';
const config = require('./config');
const pg = require('pg');
var promise = require('bluebird');

pg.defaults.ssl = true;
var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var db=pgp(process.env.DATABASE_URL);


module.exports = function(projetID,fonctionID){
    var fs = require('fs');
    let text="";
    console.log(projetID)
    console.log(fonctionID)
    db.any(`SELECT personne FROM projet WHERE fonction='Test Lead'`)
        .then(data => {
            var jsonfile = require('jsonfile')
            var file = 'file1.json'
            var obj = data

            jsonfile.writeFile(file, data, function (err) {
                console.error(err)
            })
        })
        .catch(error =>{
            console.log('ERROR:', error);
        });
}