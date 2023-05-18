const axiosInstance = axios.create({
    baseURL: 'http://16.16.156.251:3000'
});

let token = localStorage.getItem('token');
let user;

function decodeToken() {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

user = decodeToken();