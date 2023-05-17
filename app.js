const express = require('express');
const app = express();
require("dotenv").config();
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();``
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userRecords = require('./users');
const bcrypt = require('bcrypt');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

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

app.post('/reset-password-email', function (req, res, next) {
    console.log(req.body);
    let email = req.body.email;
    userRecords.findByEmail(email, function(err, record) {
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
    })

});

app.listen(PORT, () =>{
    console.log('Server is listening on port 4001...' )
    
})