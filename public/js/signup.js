const signUpForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const alertText = document.getElementById('alert-text');

if(token)
    window.location.href = '../../dashboard/expense.html';
else
    localStorage.removeItem('token');

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const result = await axiosInstance.post('/user/signup', user);
        result.data.message += 'Moving to the login page';
        setAlert(result);
        setTimeout(() => {
            window.location.href="../login/login.html";
        }, 2000);
    } catch(err) {
        setAlert(err.response);
    }
});

function setAlert(result) {
    if(!result.data.success) {
        alertText.innerText = result.data.message;
        if(alertText.classList.contains('alert-success'))
            alertText.classList.remove('alert-success');
        if(!alertText.classList.contains('alert-danger'))
            alertText.classList.add('alert-danger');
        alertText.hidden = "";
    }
    else {
        alertText.innerText = result.data.message;
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
};