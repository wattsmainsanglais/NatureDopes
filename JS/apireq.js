
const urlToPost = 'http://localhost:4001/markerList'

const postMarker = async () => {
    const speciesName = document.getElementById('species-name').value;
    const firstRef = document.getElementById('firstRef').value;
    const secondRef = document.getElementById('secondRef').value;

    const data = JSON.stringify({speciesName: speciesName, firstRef: firstRef, secondRef: secondRef});
      
    try {
        const response = await fetch(urlToPost, {
            method: 'POST',
            body: data,
            
        });
            if(response.ok){
          const jsonResponse = await response.json();
          console.log(jsonResponse);
        }
      } catch (error) {
        console.log(error);
      }
    }

    export {postMarker}; 