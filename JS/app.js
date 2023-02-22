const express = require('express');
const app = express();

const PORT = process.env.PORT || 4001;

/*const speciesName = document.getElementById('species-name');
const firstRef = document.getElementById('firstRef');
const secondRef = document.getElementById('secondRef');
*/
let markerListId = 2;

function addMarkerToArray(req, res, next){
    const id = markerListId++;
    const speciesName = req.body.speciesName;
    const firstRef = req.body.firstRef;
    const secondRef = req.body.secondRef;
    
    markerList.push({id: id, speciesName: speciesName, firstRef: firstRef, secondRef: secondRef});

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
    res.status(200).send('New discovery added to array');
})

app.listen(PORT, () =>{
    console.log('Server is listening on port 4001...' )
})