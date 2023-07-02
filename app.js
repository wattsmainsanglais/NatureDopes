const express = require('express');
const app = express();
require('dotenv').config()
const bodyParser = require('body-parser');

const session = require('express-session');
const store = new session.MemoryStore();``
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const userFunctions = require('./users');
const postMarker = require('./postNewMarker')

const bcrypt = require('bcrypt');


const randtoken = require('rand-token'); //token generator for login/password reset
const helmet = require('helmet')
const validator = require('validator');

const nodemailer = require('nodemailer');
const sendMail = require('./sendmail');



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
  user: process.env.USERDB,
  host: 'localhost',
  database: process.env.DB,
  password: process.env.PASSDB,
  port: 5432,
})


app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
      "default-src 'self'; font-src 'self' https://fonts.gstatic.com static.juicer.io; img-src 'self' 'unsafe-inline' data: blob: https://www.juicer.io; script-src 'self' unpkg.com assets.juicer.io 'unsafe-inline'; style-src 'self' 'unsafe-inline' unpkg.com https://fonts.googleapis.com assets.juicer.io; frame-src 'self'; connect-src http://www.juicer.io https://www.juicer.io https://api.maptiler.com http://localhost:4001; worker-src blob:; child-src blob:"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});


                       /* "assets.juicer.io", 
                        "https://unpkg.com/validator@latest/validator.min.js",
                        "https://fonts.googleapis.com",
                        "https://unpkg.com/maplibre-gl@3.0.1/dist/maplibre-gl.js",
                     */
           

const { render } = require('ejs');

const port = process.env.PORT || 4001;

app.use(express.static(__dirname + '/views/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');



  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:true}));

  passport.use(new LocalStrategy(function(username, password, done){
    console.log('passport starting')
    

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
      
    }); 
  });

  passport.deserializeUser((id, done) => {
  
    console.log('deserialize')
    process.nextTick(function() {
      pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        

        if(err){
          return done(err);
        }
      
        if(result.rows[0].id == id){

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

/* Depracted function, used before hook upto database
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

*/


app.get('/', (req, res) =>{
  
  
  res.render('index');
})

app.get('/index', (req, res) =>{
  
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

    pool.query('SELECT species_name, gps_long, gps_lat, image_path FROM images', function(err, result){
      if(err){
        console.log(err)
        res.status(500).send('An error has occured attempting to access our database, please try again');

      } else {
        let obj = result.rows
        console.log(obj);
        res.status(200).send(obj);
        console.log('Populate Get request sent')
      }
      
     })
  });

app.get('/maplogin', (req, res,) =>{
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

  let { username, password, email } = req.body;
 

  //hash the password before storage
  const salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);
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

  });

app.post('/update-password', function(req, res, next) {
 
  let token = req.body.token;
  let password = req.body.password;
 

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
  


app.listen(port, '0.0.0.0' , () =>{
    console.log('Server is listening on port 4001...' )


    
});