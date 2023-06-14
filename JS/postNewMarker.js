
const dotenv = require('dotenv')
const validator = require('validator');

const Pool = require('pg').Pool
const pool = new Pool({
  user: dotenv.USERDB,
  host: 'localhost',
  database: 'Nature_dopes',
  password: dotenv.PASSDB,
  port: 5432,
})



//function to validate data received from post to /markerlist

function checkTestPost(species, first, second, cb){
  let msg= '';
  if (!validator.isFloat(first && second)){
    msg = 'Grid references must be decimal numbers, click the location on the map and the fields will fill in automatically.';
    return cb(msg);
  } else if (!validator.isAlpha(species)){
    msg= 'Species name must only contain letters';
    return cb(msg);
  } else {
    return cb(null)
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



