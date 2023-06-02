

/*import maplibregl from 'maplibre-gl';*/ 


const urlToPost = 'http://localhost:4001/markerList'
const fetchMarkerSubmit = document.getElementById('map-button');


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

   /* fetchMarkerSubmit.addEventListener('click', () => {
      let speciesName = document.getElementById('species-name').value;
      let firstRef = document.getElementById('firstRef').value;
      let secondRef = document.getElementById('secondRef').value;
      let file = document.getElementById('upload').value
      console.log(speciesName);
      postMarker(speciesName, firstRef, secondRef, file);
    }); */

// Register new user api - post to /register & natureDopes postgresDB
    const postRegister = async (username, password, email) => {
      
      console.log('The username is' + username);
      const data = JSON.stringify({'username': username, 'password': password, 'email': email});
      const urlToPostSubmit = 'http://localhost:4001/register';
      const displayTag = document.getElementById('postRegister-response-msg')

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
        displayTag.innerHTML = jsonResponse + ' <a href="maplogin">login</a>';
       
      }
    } catch (error) {

      console.log('What is going on?', error);
      displayTag.innerHTML = 'There is a problem with registration, please try again. If problem persists, please contact us.'
    }
  }

  
  
    document.getElementById('register_button').addEventListener('click', () => {
    let display = document.getElementById('postRegister-response-msg');
      
    console.log('button clicked');
    let username = document.getElementById('username_r').value;
    let password = document.getElementById('password_r').value;
    let email = document.getElementById('email').value;
    
    if(username == "" || password == "" || email == ""){
        
      display.innerHTML  = 'Please complete all fields';
    } else {
       console.log(username);
      postRegister( username, password, email); 
    }
    });

   

    const processPopulateMarkers = (first, second, name) => {
  
      var marker = new maplibregl.Marker({
        color: '#5B9240',
        scale: 1,
    })
    
        .setLngLat([first, second])
        .setPopup(new maplibregl.Popup().setHTML(name))
        .addTo(map);
     }  
    

    // post request function to fetch markers/ objects from server and populate them on the map.
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

 
//post email address to server and handle response

const emailPasswordResetURL = 'http://localhost:4001/reset-password-email'

const handleEmail = async(email) => {

  const displayTag = document.getElementById('postReponse_reset-password-email-p')
  const data = JSON.stringify({'email': email})
  try{
    const response = await fetch(emailPasswordResetURL,{
        method: 'POST',
        body: data,

        headers: {
        'Content-type': 'application/json',     
        }
      });
      
      if (response.ok) {
        const jsonResponse = await response.json();
        console.log(jsonResponse)
        displayTag.innerHTML = jsonResponse;


      }
  }

  catch(error){
    console.log(error);

  }
}

document.getElementById('reset-password-email-input-button').addEventListener('click', () =>{
  let email = document.getElementById('reset-email-input').value;
  handleEmail(email);
})