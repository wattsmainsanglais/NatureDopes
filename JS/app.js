const express = require('express');
const app = express();
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 4001;

app.use(express.static('naturedopes'));

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

/*const speciesName = document.getElementById('species-name');
const firstRef = document.getElementById('firstRef');
const secondRef = document.getElementById('secondRef');
*/
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

app.post('/markerlist', addMarkerToArray, (req, res, next) => {
    console.log(req.body);
    res.status(201).send(req.body);
    console.log(markerList);
})

app.listen(PORT, () =>{
    console.log('Server is listening on port 4001...' )
})