
function displayEmail(){
    
    const emailC = document.getElementById('email-contact')
    emailC.style.visibility = 'visible';
}

function hideEmail(){
    
    const emailC = document.getElementById('email-contact')
    emailC.style.visibility = 'hidden';
}

document.getElementById('email-logo').addEventListener('click', displayEmail);
document.getElementById('email-contact').addEventListener('click', hideEmail);




function displayAbout(){
        
    document.querySelector("p#slide_1").classList.add("left");
    document.querySelector("p#slide_2").classList.add("right");
};