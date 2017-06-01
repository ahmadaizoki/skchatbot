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


module.exports = function(fonctionID){
    var fs = require('fs');
    console.log(fonctionID)
    db.any(`SELECT * FROM projet`)
        .then(data => {
            var jsonfile = require('jsonfile');
            var file = 'file1.json';
            var obj = data;
            console.log(data);

            jsonfile.writeFile(file, data, function (err) {
                console.error(err)
            })
        })
        .catch(error =>{
            console.log('ERROR1:', error);
        });
}