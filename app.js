const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();``
const passport = require('passport');
const LocalStrategy = require('passport-local');
const userRecords = require('./users');

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

  passport.use(new LocalStrategy(function(username, password, done){
    userRecords.records.findOne({username: username}, function(err, user){
      if(err){
        return done(err);
      }
      if(!user){
        return done(null, false);
      }
      if(!user.verifyPassword(password)){
        return done (null, false);
      }
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
  res.render('maplogin');
}); 

app.get('/register', (req, res, next) => {
  console.log('This Route works');

  res.render('maplogin');
})

app.post("/register", async (req, res,) => {
  console.log(req.body);
  const { username, password } = req.body;
  // Create new user:
  const newUser = await userRecords.createUser({username, password});
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

app.listen(PORT, () =>{
    console.log('Server is listening on port 4001...' )
    
})