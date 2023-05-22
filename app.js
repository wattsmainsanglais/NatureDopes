const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();``
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userRecords = require('./users');
const bcrypt = require('bcrypt');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' });
const randtoken = require('rand-token'); //token generator for login/password reset
const flash = require('express-flash');
const nodemailer = require('nodemailer');
const sendMail = require('./JS/sendmail');

dotenv.config();
//database connection
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'watts',
  host: 'localhost',
  database: 'Nature_dopes',
  password: 'kwjibo',
  port: 5432,
})

const { render } = require('ejs');

const PORT = process.env.PORT || 4001;

app.use(express.static(__dirname + '/views/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:true}));
  
  app.use(
    session({
      secret: 'random',
      cookie: {maxAge: 172800000, secure: false, sameSite: 'none'},
      resave: false,
      saveUninitialized: false,
      store
    })
  );

  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    userRecords.findById(id, function (err, user) {
      if (err) {
        return done(err);
      }
      done(null, user);
    });
  });
  


  passport.use(new LocalStrategy(function(username, password, done){
    console.log('passport starting')
    console.log(username)
    
    userRecords.findByUsername(username, function(err, user){
      if(err){
        console.log('error')
        return done(err);
      }
      if(!user){
        console.log('user not found ' + username)
        return done(null, false);
      }
      bcrypt.compare(password, user.password, function (err, result){
          if(!result){
          console.log('password incorrect')
          return done (null, false);
          }
          if(result){

          console.log('user found')
          return done(null, user);
          }

      });
    });
  }));



let markerListId = 3;

function addMarkerToArray(req, res, next){
    const obj = Object.assign({},req.body)
    
    console.log(obj);
    
    const id = markerListId++;
    let species = obj.speciesName;
    let first = obj.firstRef;
    let second = obj.secondRef;
    let upload = req.body.upload; // will be on req.file 
    

    markerList.push({'id': id, 'speciesName': species, 'firstRef': first, 'secondRef': second});
    next()
}

let markerList = [
    {
        id: 1,
        speciesName: 'Violet',
        firstRef: 2,
        secondRef: 2
    },
    {
        id: 2,
        speciesName: 'Daisy',
        firstRef: 1,
        secondRef: 1 
    }

]

app.get('/index', (req, res) =>{
  console.log(req.session);
})

app.post('/imgUpload',  (req, res, next) => {
  
  res.redirect('map');
});

/*, addMarkerToArray, */
app.post('/markerlist',  upload.single('upload'), addMarkerToArray,(req, res, next) => {
   
    console.log(req.file);
    res.status(201).redirect('map');
    console.log(markerList);
    console.log(req.session);
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
  // Create new user:
  const newUser = await userRecords.createUser({username, password, email});
  // Add if/else statement with the new user as the condition:
  if (newUser) {
    // Send correct response if new user is created:
    console.log('user created')
    /*res.redirect('maplogin')*/
    res.status(201).redirect('maplogin');
    
  } else {
    // Send correct response if new user failed to be created:
    res.status(500).json({
      msg: "User was not created!"
    });
  }
  
});

// POST request for logging in
app.post("/maplogin", passport.authenticate("local", { failureRedirect: "/maploginFail", failureMessage: 'Password incorrect, please try again'}), (req, res) => {
      console.log(req.session.user)
      res.redirect("map");
    
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
 
                type = 'success';
                msg = 'The reset password link has been sent to your email address, please check your inbox';
 
            } else {
                type = 'error';
                msg = 'Something goes to wrong. Please try again';
            }
 
        } else {
            console.log('2');
            type = 'error';
            msg = 'The Email is not registered with us';
            
        }
    
        req.flash(type, msg);
        res.redirect('/maplogin');
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

      req.flash(type, msg);
      res.redirect('/maplogin');
  });
})

app.listen(PORT, () =>{
    console.log('Server is listening on port 4001...' )
    
});