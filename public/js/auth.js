const signUpForm = document.getElementById('signup-form');
const signInForm = document.getElementById('signin-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const alertText = document.getElementById('alert-text');

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000'
});

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');

    const user = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const result = await axiosInstance.post('/user/signup', user);
        setAlert(result, signUpForm, "Some error occured!", "You are registered succesfully!");
        
    } catch(err) {
        console.log(err);
    }
});

signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = {
        name: nameInput.value,
        password: passwordInput.value
    };

    try {
        const result = await axiosInstance.post('/user/signin', user);
        setAlert(result, signInForm, "Some error occurred!", "You are logged in succesfully!");
    } catch(err) {
        console.log(err);
    }
});

function setAlert(result, form, alertTextFail, alertTextPass) {
    if(result.data.success === "false") {
        alertText.innerText = alertTextFail;
        if(alertText.classList.contains('alert-success'))
            alertText.classList.remove('alert-success');
        if(!alertText.classList.contains('alert-danger'))
            alertText.classList.add('alert-danger');
        alertText.hidden = "";
    }
    else {
        alertText.innerText = alertTextPass;
        if(alertText.classList.contains('alert-danger'))
            alertText.classList.remove('alert-danger');
        if(!alertText.classList.contains('alert-success'))
            alertText.classList.add('alert-success');
        alertText.hidden = "";
    }
    form.reset();
    setTimeout(() => {
        alertText.hidden = "hidden";
    }, 5000);
}