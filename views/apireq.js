

/*import maplibregl from 'maplibre-gl';*/ 


const urlToPost = 'http://localhost:4001/markerList'
const fetchMarkerSubmit = document.getElementById('map-button');

/*
// function to post new marker request to server with eventlistener
const postMarker = async (speciesName, firstRef, secondRef, file) => {

  
  const formdata = new FormData()

  const data = JSON.stringify({'speciesName': speciesName, 'firstRef': firstRef, 'secondRef': secondRef});
  formdata.append('data', data);    
  formdata.append('file', file);

    try {
        const response = await fetch(urlToPost, {
            method: 'POST',
            body: formdata,
            headers: {
              'Content-type': 'application/json',     
            }  
        });
            if(response.ok){
          const jsonResponse = await response.json();
          console.log(jsonResponse);

        }
      } catch (error) {
        console.log('What is going on?', error);
      }
    }
*/
   /* fetchMarkerSubmit.addEventListener('click', () => {
      let speciesName = document.getElementById('species-name').value;
      let firstRef = document.getElementById('firstRef').value;
      let secondRef = document.getElementById('secondRef').value;
      let file = document.getElementById('upload').value
      console.log(speciesName);
      postMarker(speciesName, firstRef, secondRef, file);
    }); */



   

    const processPopulateMarkers = (first, second, name) => {
  
      let marker = new maplibregl.Marker({
        color: '#5B9240',
        scale: 1,
    })
    
        .setLngLat([first, second])
        .setPopup(new maplibregl.Popup().setHTML(name))
        .addTo(map);
     }  
    

    // post request function to fetch markers/ objects from server and populate them on the map.
   const populateMarkers = async () => {
      try {
        const response = await fetch(urlToPost, { headers: {
          'Content-type': 'application/json'     
        }})
        console.log('api sent');
         
            if(response.ok){
            
              const jsonResponse = await response.json();
             
              let array = jsonResponse.markerList;
                for(let i in array){
                  let first = array[i].firstRef;
                  let second = array[i].secondRef;
                  let name = array[i].speciesName;
                  processPopulateMarkers(first, second, name);
                  
              }

            } else {
              console.log('not receiving response', response)
            }
      }
      catch (error) {
        console.log(error);
      }

   }

  // event listener for populate marker function
   document.getElementById("populateMarkers_button").addEventListener('click', populateMarkers)
    
   function infoBoxReveal(){
    document.querySelector('.map_aside_info_box').style.display = 'block';
     }
    let infoLogo =  document.getElementById('map_aside_info_logo')
    const infoLogoOn = infoLogo.addEventListener('mouseover', infoBoxReveal);
  
    function infoBoxhide(){
    document.querySelector('.map_aside_info_box').style.display = 'none';
    }
    const inforLogoOut = infoLogo.addEventListener('mouseout', infoBoxhide);

    if(infoLogoOn){
      infoBoxReveal();
    } else if (inforLogoOut) {
      infoBoxhide();
    }