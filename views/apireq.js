
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
        const response = fetch(urlToPost)
          if (response.ok){
            const jsonResponse = await response.json();
            console.log(jsonResponse);
          }
      }
      catch (error) {
        console.log(error);
      }

   }

    

    