const mapTilerURL = 'https://api.maptiler.com/maps/streets/style.json?key=';
const mapTilerKey = 'PSMy7BMmV1X1YJoVOzD1';
const mapLibreUrl ='https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js'
;
const styleEndpointURL = `${mapTilerURL}${mapTilerKey}`;

const mapDiv = document.getElementById('map');

var map = new maplibregl.Map({
    container: 'map',
    style: styleEndpointURL, // stylesheet location
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 1 // starting zoom
   
    });

const getMaps = async () => {
  
try{
  const response = await fetch(mapLibreUrl);
  if (response.ok) {

    const styleResponse = await fetch(styleEndpointURL);
        if(styleResponse.ok){
            return map;

        }
    }
} catch (error) {
  console.log(error);
}

};

   
  function newMark(){
    let firstRef = document.getElementById("firstRef").value;
    let secondRef = document.getElementById("secondRef").value;
    var marker = new maplibregl.Marker()
        .setLngLat([firstRef, secondRef])
        .addTo(map);
  }