'use strict';
const config = require('./config');
var promise = require('bluebird');


pg.defaults.ssl = true;
var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var db=pgp(process.env.DATABASE_URL);


module.exports = function(fonctionID){
    console.log(fonctionID)
    db.any(`SELECT * FROM projet`)
        .then(data => {
            var jsonfile = require('jsonfile')
            var file = './file1.json'
            jsonfile.writeFileSync(file,data, function (err) {
                console.error('errorrr:',err)
            })
        })
        .catch(error =>{
            console.log('ERROR1:', error);
        });
}