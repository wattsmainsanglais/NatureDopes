const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const session = require('express-session');
const store = new session.MemoryStore();``
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const userFunctions = require('./users');
const postMarker = require('./js/postNewMarker')

const bcrypt = require('bcrypt');


const randtoken = require('rand-token'); //token generator for login/password reset
const helmet = require('helmet')
const validator = require('validator');

const nodemailer = require('nodemailer');
const sendMail = require('./JS/sendmail');

dotenv.config();

const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'views/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname )
  }
})

const upload = multer({ storage: storage});


//database connection
const Pool = require('pg').Pool
const pool = new Pool({
  user: dotenv.USERDB,
  host: 'localhost',
  database: 'Nature_dopes',
  password: dotenv.PASSDB,
  port: 5432,
})


/*app.use(
    helmet({
      contentSecurityPolicy: false, 
      
    })
    
  
);*/

const { render } = require('ejs');

const PORT = process.env.PORT || 4001;

app.use(express.static(__dirname + '/views/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');



  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:true}));

  passport.use(new LocalStrategy(function(username, password, done){
    console.log('passport starting')
    console.log(username)

    pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
      if(err){
        console.log(err);
        return done(err);
      }

        if(result.rows.length > 0){ 
          console.log(result.rows[0].username)
         
          const dbPass = result.rows[0].password;
          bcrypt.compare(password, dbPass, function (err, res) {
           
            if(!res){
              console.log('password incorrect')
              return done (null, false);
              }
              if(res){

                console.log('user found')
                return done(null, result.rows[0]);
              }
          });
        } 
        if (result.rows.length === 0) {
          
          console.log('user not found ' + username)
          return done(null, false);
        }


    });
    
  }));

  passport.serializeUser((user, done) => {
   
    process.nextTick(function(){
      done(null, user.id);
      console.log(user.id + 'serialize')
    }); 
  });

  passport.deserializeUser((id, done) => {
  
    console.log('deserialize')
    process.nextTick(function() {
      pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        console.log(id)
          console.log(result.rows[0]);

        if(err){
          console.log('des error')
         
          return done(err);
        }
      
        if(result.rows[0].id == id){
         
          console.log('des sucess')
          
          return done(null, id);
        } else {

          err = "User " + id + " does not exist";
         
          console.log(err);
          return done(err);

        }

      });
    });
    
  });
  
  app.use(
    session({
      secret: 'random',
      cookie: {maxAge: 172800000, secure: false, sameSite: 'lax'},
      resave: false,
      saveUninitialized: false,
      store
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(passport.authenticate('session'));


let markerListId = 3;

function addMarkerToArray(req, res, next){
    
  const obj = Object.assign({},req.body)
    
    console.log(obj);
    
    const id = markerListId++;
    let species = obj.speciesName;
    let first = obj.firstRef;
    let second = obj.secondRef;
    let upload = req.file.filename; // will be on req.file 
    

    markerList.push({'id': id, 'speciesName': species, 'firstRef': first, 'secondRef': second, 'path': upload});
    next()
}

let markerList = [
    {
        id: 1,
        speciesName: 'Violet',
        firstRef: 2,
        secondRef: 2,
        path: '1686145623944-8982424-RedRobinOrig.jpg'
    },
    {
        id: 2,
        speciesName: 'Daisy',
        firstRef: 1,
        secondRef: 1 ,
        path: '1686145623944-8982424-RedRobinOrig.jpg'
    }

]

app.get('/', (req, res) =>{
  console.log(req.session);
  
  res.render('index');
})

app.get('/index', (req, res) =>{
  console.log(req.session);
  res.render('index');
})

app.get('/gallery', (req, res) =>{
  res.render('gallery');
})

app.post('/imgUpload',  (req, res, next) => {
  
  res.redirect('map');
});

/*, addMarkerToArray, */
app.post('/markerlist',  upload.single('upload'), (req, res, next) => {
   
  console.log(req.body);
  console.log(req.file);
  console.log(req.user);
  let {speciesName, firstRef, secondRef} = req.body;
  let filePath = req.file.filename;
  let userNum = req.user
 

  postMarker.addMarkertoDatabase(speciesName, firstRef, secondRef, filePath, userNum, function(err, msg){

    console.log(msg);
    if (err){
      res.status(500).send(err);
    } 
    
    if(msg){
      
      const msgToClient = JSON.stringify(msg);
      res.status(201).send(msgToClient);
    }

  })


   
});

app.get('/markerlist', (req, res ,next) => {
    console.log('Populate Get request received');

    let obj = {markerList}
    let markerListApi = JSON.stringify(obj);
    

    res.status(200).setHeader('content-type', 'application/json').send(markerListApi);
    console.log('Populate Get request sent')
});

app.get('/maplogin', (req, res,) =>{
  
  console.log(req.session);
  if(req.user) {
    res.redirect('map');
  } else {
    
    res.render('maplogin');
  }
}); 


app.get('/maploginFail', (req, res) => {
  
  res.render('maploginFail');
});

app.get('/map', (req, res,) =>{
  console.log(req.session);
  console.log(req.user);
  if(req.user) {
    res.render('map');

  } else {
    res.redirect('maplogin');
  }
 
}); 

app.get('/register', (req, res, next) => {
  console.log('This Route works');

  res.render('/maplogin');
})

app.post("/register", async (req, res,) => {
  console.log(req.body);
  let { username, password, email } = req.body;
 

  //hash the password before storage
  const salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);
  console.log(hash);
  password = hash;
  
  // Create new user, function stored in users.js:

  userFunctions.registerNewUser(username, password, email, function(err, msg){
    console.log(msg);
    if (err){
      res.status(500).send(err);
    } 
    
    if(msg){
      
      const msgToClient = JSON.stringify(msg);
      res.status(201).send(msgToClient);
    }
  })
  
});

// POST request for logging in
app.post("/maplogin", passport.authenticate("local", {failureRedirect: "/maploginFail", failureMessage: 'Password incorrect, please try again'}), function(req, res, next) {
      res.redirect('map');
});


//Post request for logging out of passportJS
app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    console.log('User logging out')
    res.redirect('/maplogin');
  });

});

app.get('/reset-password-email', function(req, res, next){
  
  res.render('reset-password-email');

})

app.post('/reset-password-email', function (req, res, next) {
    console.log(req.body);
    let email = req.body.email;
   
    /*userRecords.findByEmail(email, function(err, record) {
      if(err){
        console.log(error)
        res.redirect('/maplogin');
      }
      
      if(!record){
        console.log('This user/email address is not on record')
        res.redirect('/mapThanks')
      }

      if(record){
        console.log('email/user found, email being sent')
        
        res.redirect('/mapThanks');
      }
    }) */

    pool.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
      if (err) throw err;
         
        let type = ''
        let msg = ''
     
        if (result.rows.length > 0) {

           console.log(result.rows[0].email) 
           let token = randtoken.generate(20);
 
           let sent = sendMail(email, token);
 
             if (sent != '0') {
 
                pool.query('UPDATE users SET token = $1 WHERE email = $2', [token, email], function(err, result) {
                    if(err) throw err
         
                });
                type = 'success'
                msg = 'The reset password link has been sent to your email address, please check your inbox';
                msg = JSON.stringify(msg);
                res.status(201).send(msg)
                console.log(msg)


            } else {
                type = 'error';
                msg = 'Something has gone wrong. Please try again. If problem persists, please contact us  ';
                msg = JSON.stringify(msg);
                res.status(201).send(msg)
                console.log(msg)
                
            }
 
        } else {
            
            type = 'error';
            msg = 'Sorry, this Email is not registered with us. Please enter a different email address or create a new user';
            msg = JSON.stringify(msg);
            res.status(201).send(msg)
                console.log(msg)
        }
    
      
    });
});

app.get('/reset-password', function(req, res, next) {
  
  res.render('reset-password', {
  title: 'Reset Password Page',
  token: req.query.token 
  });
  console.log(req.token);
  });

app.post('/update-password', function(req, res, next) {
 
  let token = req.body.token;
  let password = req.body.password;
  console.log(token);

 pool.query('SELECT * FROM users WHERE token = $1', [token], function(err, result) {
      if (err) throw err;
      let type
      let msg

      let dbToken = result.rows[0].token;

      console.log(dbToken + ' received');
      if (token === dbToken) {
            console.log(dbToken + ' is matched');
            let saltRounds = 10;
            let email= result.rows[0].email
           // var hash = bcrypt.hash(password, saltRounds);

          bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {

                  console.log(hash);
                  let password = hash

                  pool.query('UPDATE users SET password = $1 WHERE email = $2', [password, email] , function(err, result) {
                      if(err) throw err
                 
                  });

                  pool.query('UPDATE users SET token = NULL WHERE token = $1', [token], function(err, result) {
                    if(err) throw err
                  });

                });
            });

          type = 'success';
          msg = 'Your password has been updated successfully';
            
      } else {

          console.log('2');
          type = 'success';
          msg = 'Invalid link; please try again';

          }
      
      console.log(msg)
      res.redirect('/update-password-thanks');
  });
})

  app.get('/update-password-thanks', function(req, res ,next) {
   
    res.render('Thanks-email')
    

  
    });
  
  
  

app.listen(PORT, () =>{
    console.log('Server is listening on port 4001...' )
    
});