const signUpForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const alertText = document.getElementById('alert-text');

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000'
})

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const result = await axiosInstance.post('/user/signup', user);
        if(result.data.success === "false") {
            alertText.innerText = 'Some error ocurred!';
            if(alertText.classList.contains('alert-success'))
                alertText.classList.remove('alert-success');
            if(!alertText.classList.contains('alert-danger'))
                alertText.classList.add('alert-danger');
            alertText.hidden = "";
        }
        else {
            alertText.innerText = 'You are registered succcesfully!';
            if(alertText.classList.contains('alert-danger'))
                alertText.classList.remove('alert-danger');
            if(!alertText.classList.contains('alert-success'))
                alertText.classList.add('alert-success');
            alertText.hidden = "";
        }
        signUpForm.reset();
        setTimeout(() => {
            alertText.hidden = "hidden";
        }, 5000);
    } catch(err) {
        console.log(err);
    }
});