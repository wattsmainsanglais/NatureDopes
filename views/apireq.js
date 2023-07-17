
// Javascript functions for map.ejs
/*import maplibregl from 'maplibre-gl';*/ 



const urlToPost = 'https://www.naturedopes.com/markerList'

const postMarkerSubmit = document.getElementById('map-button');

// create element for loading gif
const uploadModalP = document.getElementById('postMarkerModal-p');
const imgContainer = document.createElement('img');
imgContainer.setAttribute('src', 'Images/Growing_flower.gif');



//function to post new marker request to server with eventlistener
const postMarker = async (speciesName, firstRef, secondRef, file) => {
 
  document.getElementById('postMarkerModal-p').innerText = '';
  
  const formdata = new FormData()

  formdata.append('firstRef', firstRef)
  formdata.append('secondRef', secondRef)
  formdata.append ('speciesName', speciesName)
    
  formdata.append('upload', file);

    try {
       uploadModalP.appendChild(imgContainer);
     const response = await fetch(urlToPost, {
            method: 'POST',
            credentials: 'include',
            body: formdata,
            
        });
         
            if(response.ok){
          const jsonResponse = await response.json();
            uploadModalP.innerText = jsonResponse
           
        }
      } catch (error) {
        console.log('What is going on?', error);
        document.getElementById('postMarkerModal-p').innerText = error
      }
}

// function to clear form after post
function clearData(){
  document.getElementById('map-form').reset();
}


// event listener for post marker function
   postMarkerSubmit.addEventListener('click', () => {
      let msg = ''; 
      let speciesName = document.getElementById('speciesName').value;
      let firstRef = document.getElementById('firstRef').value;
      let secondRef = document.getElementById('secondRef').value;
      let file = document.getElementById('upload').files[0]

      if(speciesName == '' || firstRef == '' || secondRef == ''){
        
        msg = 'Please ensure the first 3 fields are completed';
        document.getElementById('postMarkerModal-p').innerText = msg
      } else {

      postMarker(speciesName, firstRef, secondRef, file);
      clearData();
      }

    }); 



   

  const processPopulateMarkers = (name, first, second, path) => {
  
      const realPath = '../data/uploads/'+ path;
      console.log(realPath);
      let pathTag
      if(path === 'null'){
        pathTag = '<img width="100" height="100" src="" alt=" No photo for this find, but just as valuable, Thanks!"><h2>' + name +'</h2>';

      } else {
        pathTag = '<img width="100" height="100" src='+ realPath +' aria-label="picture of a ' + name + '!"><h2>' + name +'</h2>'; 
      }

      let marker = new maplibregl.Marker({
        color: '#5B9240',
        scale: 1,
    })
    
        .setLngLat([first, second])
        .setPopup(new maplibregl.Popup().setHTML(pathTag))
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
              
              let array = jsonResponse;
                for(let i in array){
                  let name = array[i].species_name;
                  
                  let first = array[i].gps_long;
                  let second = array[i].gps_lat;
                   let path = array[i].image_path;
                  processPopulateMarkers(name, first, second, path);
                
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
    

  //extra info box 
   function infoBoxReveal(){
    
    document.querySelector('.map_aside_info_box').style.display = 'block';
     }

    let infoLogo =  document.getElementById('map_aside_info_logo')
    const infoLogoOn = infoLogo.addEventListener('mouseover', infoBoxReveal);

  
    function infoBoxhide(){
    document.querySelector('.map_aside_info_box').style.display = 'none';
    }

    const inforLogoOut = infoLogo.addEventListener('mouseout', infoBoxhide);
    const mobileLogoOn = infoLogo.addEventListener('touchstart', infoBoxReveal);
    const mobileLogoOut = infoLogo.addEventListener('touchend', infoBoxhide); 


    if(window.matchMedia("(max-width: 1100px)").matches){
      if(mobileLogoOn){
        infoBoxReveal();
      } else if (mobileLogoOut){
        infoBoxhide();
      }
      
    } else {
      if(infoLogoOn){
        infoBoxReveal();
      } else if (inforLogoOut){
        infoBoxhide()
      }
    }

    // functions to display post marker Modal success/fail

    // Get the modal
const modal = document.getElementById("postMarkerModal");

// Get the button that opens the modal
const btn = document.getElementById("map-button");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("closePostMarker")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 
