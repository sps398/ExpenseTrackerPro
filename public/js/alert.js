
// export function setAlert(result, form, alertTextFail, alertTextPass) {
//     if(result.data.success === "false") {
//         alertText.innerText = alertTextFail;
//         if(alertText.classList.contains('alert-success'))
//             alertText.classList.remove('alert-success');
//         if(!alertText.classList.contains('alert-danger'))
//             alertText.classList.add('alert-danger');
//         alertText.hidden = "";
//     }
//     else {
//         alertText.innerText = alertTextPass;
//         if(alertText.classList.contains('alert-danger'))
//             alertText.classList.remove('alert-danger');
//         if(!alertText.classList.contains('alert-success'))
//             alertText.classList.add('alert-success');
//         alertText.hidden = "";
//     }
//     form.reset();
//     setTimeout(() => {
//         alertText.hidden = "hidden";
//     }, 5000);
// };