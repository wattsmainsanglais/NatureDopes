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
      console.log(jsonResponse[0]);
      if (jsonResponse[0] == 'T'){
        console.log('true');
        displayTag.innerHTML = jsonResponse + ' <a href="maplogin">login</a>';
      } else {
        displayTag.innerHTML = jsonResponse;
      }
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