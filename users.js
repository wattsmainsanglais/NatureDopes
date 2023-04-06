let records = [
    {
      id: 1, 
      username: "sam",
      password: "$2b$10$1p3iRGFp5.EbXFDwS0qts.t.TiTA9tkha5LY8bhHLXEcKueaMyKEe", //same
    },
    {
      id: 2,
      username: "jill",
      password: "birthday",
    },
  ];
  
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
      console.log('finding user' + username)
      for (let i = 0, len = records.length; i < len; i++) {
        let record = records[i];
        if (record.username === username) {
          return cb(null, record);
        }
      }
      return cb(null, null);
    });
  };
  
