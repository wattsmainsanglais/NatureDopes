
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
    })
   

    /*fetchRandomButton.addEventListener('click', () => {
      fetch('/api/quotes/random')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          renderError(response);
        }
      })
      .then(response => {
        renderQuotes([response.quote]);
      });
    });
    */