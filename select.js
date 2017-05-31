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
            text=data;
            fs.writeFile('./file1',data,function (err) {
                if(err) {
                    return console.log(err);
                }

                console.log("The file was saved!");

            });
            console.log(data);
        })
        .catch(error =>{
            console.log('ERROR:', error);
        });
}