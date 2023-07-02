require('dotenv').config()
const validator = require('validator');

const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
})



  const getNewId = (array) => {
    if (array.length > 0) {
      return array[array.length - 1].id + 1;
    } else {
      return 1;
    }
  };

  exports.findById = function (id, cb) {
    process.nextTick(function () {
      var idx = id - 1;
      if (records[idx]) {
        cb(null, records[idx]);
      } else {
        cb(new Error("User " + id + " does not exist"));
      }
    });
  };
  
  exports.createUser = function (user) {
    return new Promise((resolve, reject) => {
      const newUser = {
        id: getNewId(records),
        ...user,
      };
      records = [newUser, ...records];
      console.log(records);
      resolve(newUser);
    });
  };


  exports.findByUsername = function (username, cb) {
    process.nextTick(function () {
      console.log('finding user ' + username)
      for (let i = 0, len = records.length; i < len; i++) {
        let record = records[i];
        if (record.username === username) {
          return cb(null, record);
        }
      }
      return cb(null, null);
    });
  };

  exports.findByEmail = function (email, cb) {
    process.nextTick(function () {
      console.log('finding email ' + email);
      for (let i = 0, len = records.length; i < len; i++) {
        let record = records[i];
        if (record.email === email) {
          return cb(null, record);
        }
      }
      return cb (null, null);
    });
  };

  checksTest = function(username, email, cb){
    let msg=''
    if(!validator.isEmail(email)){
       msg = 'Please use a valid email address';
       return cb(msg);
    } else if(!validator.isAlphanumeric(username, 'en-GB')){
      msg = 'Please use only letters and numbers for your Username';
       return cb(msg);
    }
    
     else {
      return cb(null);
    }

  }



  exports.registerNewUser = function(username, password, email, cb){
    
  let msg = ''; 
     checksTest(password, email, function(checkmsg){
      console.log(checkmsg);
      if(checkmsg){
        msg = checkmsg
        return cb(null, msg)
      } else {

        pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email], function(err, result){
          console.log(result.rows)
          if (result.rows.length > 0){
            console.log('this user already exisits')
            msg = 'User ' + result.rows[0].username + ' already exists, please register with a different username/ email'
            return cb(null, msg);
        
          }
          else if (result.rows == 0){
            let safeEmail = validator.escape(email);
            pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING username', [username, password, safeEmail], function(err, result){
            if(err){
              console.log(err)
              msg = 'Error posting data to server '
              return cb(null, msg);
            }
            else {
              console.log(result.rows[0])
              msg = 'Thankyou, a new account has been created for ' + result.rows[0].username + ' please proceed to '

              return cb(null, msg);
            }

            })
          }

          else {
          console.log(err)
            return (null, null);
          }

      })
      
    }

  }) 
}

 


