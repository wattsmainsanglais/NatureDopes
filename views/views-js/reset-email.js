//post email address to server and handle response

const emailPasswordResetURL = 'https://www.naturedopes.com/reset-password-email'

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
