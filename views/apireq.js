
/* import maplibregl from 'maplibre-gl'; */
const urlToPost = 'http://localhost:4001/markerList'
const fetchMarkerSubmit = document.getElementById('map-button');



const postMarker = async (speciesName, firstRef, secondRef) => {

  const data = JSON.stringify({'speciesName': speciesName, 'firstRef': firstRef, 'secondRef': secondRef});
      
    try {
        const response = await fetch(urlToPost, {
            method: 'POST',
            body: data,
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

    fetchMarkerSubmit.addEventListener('click', () => {
      let speciesName = document.getElementById('species-name').value;
      let firstRef = document.getElementById('firstRef').value;
      let secondRef = document.getElementById('secondRef').value;
      console.log(speciesName);
      postMarker(speciesName, firstRef, secondRef);
    });

const postRegister = async (username, password) => {
      console.log('The username is' + username);
      const data = JSON.stringify({'username': username, 'password': password});
      const urlToPostSubmit = 'http://localhost:4001/register';
      

      try{
        const response = await fetch(urlToPostSubmit, {
          method: 'POST',
          body: data,

          headers: {
            'Content-type': 'application/json',     
          }  
      });
          if(response.ok){
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        window.alert('Thank you, Registration Complete. Please login');
      }
    } catch (error) {
      console.log('What is going on?', error);
    }
  }

  
  
    /*document.getElementById('register_button').addEventListener('submit', () => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    
    console.log(username);
    postRegister(username, password); 
    alert("something"); 
    });
    */

  
   const populateMarkers = async() => {
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

 const processPopulateMarkers = (first, second, name) => {
  
  var marker = new maplibregl.Marker({
    color: '#5B9240',
    scale: 1,
})

    .setLngLat([first, second])
    .setPopup(new maplibregl.Popup().setHTML(name))
    .addTo(map);
 }  

    