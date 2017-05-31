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
    let text="";
    db.any(`SELECT personne FROM projet WHERE fonction='${fonctionID}'`)
        .then(data => {
            var jsonfile = require('jsonfile')
            var file = 'file1.json'
            var obj = data

            jsonfile.writeFile(file, data, function (err) {
                console.error(err)
                console.log(data)
                var js=require('./file1.json')
                console.log(js[0].personne)
            })
        })
        .catch(error =>{
            console.log('ERROR:', error);
        });
}