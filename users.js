const Pool = require('pg').Pool
const pool = new Pool({
  user: 'watts',
  host: 'localhost',
  database: 'Nature_dopes',
  password: 'kwjibo',
  port: 5432,
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
  

  exports.registerNewUser = function(username, password, email, cb){
    
    let msg = ''; 
    pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email], function(err, result){
      console.log(result.rows)
      if(result.rows.length > 0){
        console.log('this user already exisits')
        msg = 'User ' + result.rows[0].username + ' already exists, please register with a different username/ email'
        return cb(null, msg);
        
      }
      else if (result.rows == 0){
        pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING username', [username, password, email], function(err, result){
          if(err){
            console.log(err)
            msg = 'Error posting data to server '
            return cb(null, msg);
          }
          else {
            console.log(result.rows[0])
            msg = 'Thankyou, a new account has been created for ' + result.rows[0].username;

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
