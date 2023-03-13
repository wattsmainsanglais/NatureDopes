let records = [
    {
      id: 1, 
      username: "sam",
      password: "codec@demy10",
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