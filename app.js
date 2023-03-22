const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();``
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userRecords = require('./users');
const bcrypt = require('bcrypt');

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
        console.log('user not found' + username)
        return done(null, false);
      }
      const matchedPassword = bcrypt.compare(password, user.password);

      if(!matchedPassword){
        console.log('password incorrect')
        return done (null, false);
      }
      console.log('user found')
      return done(null, user);

    });
  }));



let markerListId = 3;

function addMarkerToArray(req, res, next){
    console.log(req.body);
    const id = markerListId++;
    let species = req.body.speciesName;
    let first = req.body.firstRef;
    let second = req.body.secondRef;
    
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


app.post('/markerlist', addMarkerToArray, (req, res, next) => {
    console.log(req.body);
    res.status(201).send(req.body);
    console.log(markerList);
    console.log(req.session);
});

app.get('/maplogin', (req, res,) =>{
  console.log(req.session);
  if(req.user) {
    res.redirect('map');
  } else {
    res.render('maplogin');
  }
}); 

app.get('/map', (req, res,) =>{
  console.log(req.session);
  res.render('map', { user: req.user });
}); 

app.get('/register', (req, res, next) => {
  console.log('This Route works');

  res.render('/maplogin');
})

app.post("/register", async (req, res,) => {
  console.log(req.body);
  const { username, password } = req.body;

  //hash the password before storage

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Create new user:
  const newUser = await userRecords.createUser({username, hash});
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
app.post("/maplogin", passport.authenticate("local", { failureRedirect: "/maplogin" }), (req, res) => {
      console.log(req.session.user)
      res.redirect("map");
    
});

app.listen(PORT, () =>{
    console.log('Server is listening on port 4001...' )
    
})