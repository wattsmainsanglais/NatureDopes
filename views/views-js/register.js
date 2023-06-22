//import validator from 'validator';//

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
      
      if (jsonResponse[0] == 'T'){
       
        displayTag.innerHTML = jsonResponse + ' <a href="maplogin">login</a>';
      } else {
        displayTag.innerHTML = jsonResponse;
      }
    }
  } catch (error) {

    console.log(error);
    displayTag.innerHTML = 'There is a problem with registration, please try again. If problem persists, please contact us.'
  }
}



  document.getElementById('register_button').addEventListener('click', () => {
  let display = document.getElementById('postRegister-response-msg');
    
 
  let username = document.getElementById('username_r').value;
  let password = document.getElementById('password_r').value;
  let email = document.getElementById('email').value;
  
  if(username == "" || password == "" || email == ""){
      display.innerHTML  = 'Please complete all fields';
  }
  else if(!validator.isLength(password, {min:8, max:20 })){
    display.innerHTML  = 'Password must be between 8 & 20 characters';
  }
  
  else {
     console.log(username);
    postRegister( username, password, email); 
  }
  });

  document.getElementById('cancelbtn').addEventListener('click', () => {
    let display = document.getElementById('postRegister-response-msg')
    display.innerHTML = 'Please complete the form below then click "register" to create a new user.';
  })