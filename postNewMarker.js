
require('dotenv').config()
const validator = require('validator');
const fs = require('fs');
const { promisify } = require('util');
const convert = require('heic-convert');


/*
//database connection
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.USERDB,
  host: 'localhost',
  database: process.env.DB,
  password: process.env.PASSDB,
  port: 5432,
});

//railway production database connection
*/
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
})


exports.heicToJpg = async function  (file, output) {
  console.log(file, output)
  const inputBuffer = await promisify(fs.readFile)(file);
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'JPEG',      // output format
    quality: 1           // the jpeg compression quality, between 0 and 1
  });

  await promisify(fs.writeFile)(output, outputBuffer);
  
}



//function to validate data received from post to /markerlist

function checkTestPost(species, first, second, cb){
 

  let msg= '';

    if(validator.isDecimal(first, {decimal_digits: '3,' ,locale: 'en-GB'})){
   
      if (validator.isDecimal(second, {decimal_digits: '3,' ,locale: 'en-GB'})){
        
        if (validator.isAlpha(species, ['en-GB'], { ignore: " -,",})){
    
        return cb(null);
        } else {
          msg= 'Species name must only contain letters';
          return cb(msg)
        }

      } else {

        msg = 'Grid references must be decimal numbers, click the location on the map and the fields will fill in automatically.';
        return cb(msg);
      } 
    } else {
      msg = 'Grid references must be decimal numbers, click the location on the map and the fields will fill in automatically.';
      return cb(msg);

    }
}

//function to add a record to the images table in DB
exports.addMarkertoDatabase = function(species, first, second, uploadPath, user, cb){
  let msg= '';

  checkTestPost(species, first, second, function(checkmsg) {
    console.log(checkmsg);
      if(checkmsg){
        msg = checkmsg
        return cb(null, msg)
      } else {
        
        pool.query('INSERT INTO images (species_name, gps_long, gps_lat, image_path, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING species_name', [species, first, second, uploadPath, user], function(err, result) {
          if(err){
            console.log(err)
            msg = 'Error posting data to server, please try again. If problem persists please contact us '
            return cb(null, msg);
          }
          else {
            console.log(result.rows[0])
            msg = 'Thankyou, a new record has been added to our database (' + result.rows[0].species_name + ')'

            return cb(null, msg);
          }
        })
      }

  })

}



