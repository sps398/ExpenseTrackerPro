const navc = document.getElementById('navc');

document.body.style.overflowX = 'hidden';

navc.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand col-lg-2 ms-3 mt-2" style="font-weight: bold;font-size: 1.5rem;" href="#">Expense
            Tracker</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item me-lg-5">
                    <a id="home" class="nav-link" aria-current="page" href="./expense.html">Home</a>
                </li>
                <li class="nav-item me-lg-5">
                    <a id="leaderboard" class="nav-link" href="./leaderboard.html">Leaderboard</a>
                </li>
                <li class="nav-item me-lg-5">
                    <a id="charts" class="nav-link" href="#">Charts</a>
                </li>
                <li class="nav-item me-lg-5">
                    <a id="downloads" class="nav-link" href="./filesdownloaded.html">Past Downloads</a>
                </li>
            </ul>
            <ul id="addBtn" class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                        Add New
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a id="addExpenseBtn" class="dropdown-item" data-bs-toggle="modal"
                                data-bs-target="#addExpenseModal" href="#">Expense</a></li>
                        <li><a id="addIncomeBtn" class="dropdown-item" href="#" data-bs-toggle="modal"
                                data-bs-target="#addIncomeModal">Income</a></li>
                    </ul>
                </li>
                <li id="prembtnc" class="nav-item ms-lg-5"><button id="prembtn" class="btn btn-outline-warning">Buy Premium</button></li>
            </ul>
            <ul class="navbar-nav me-lg-5 mb-2 mb-lg-0">
                <li class="nav-item dropdown dropdown-menu-end dropdown-menu-lg-start">
                    <a id="userprofilebtn" class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button"
                        data-bs-toggle="dropdown" aria-expanded="false">
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a id="userprofile" class="dropdown-item" href="#">My profile</a></li>
                        <li id="logout"><a class="dropdown-item" href="#">Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
    </nav>
    `;

(function makeNavPageElementActive() {
    const currPageTitle = document.title;
    const currPageEle = document.getElementById(currPageTitle.toLowerCase());
    currPageEle.classList.add('active');
    currPageEle.style.fontWeight = 'bold';
})();

document.getElementById('userprofilebtn').innerHTML = `${user.name}`;

const userProfile = document.getElementById('userprofile');

userProfile.onclick = showProfile;

function showProfile() {
    let hasPremium = (user.isPremium) ? "Yes" : "No";
    let profile = document.createElement('div');
    profile.innerHTML += `
        <div class="container w-auto position-absolute bg-dark text-white p-3" style="left:50%;top:45%;transform:translate(-50%,-50%);z-index:1000;box-shadow: 5px 5px 1000000px 1000000px #999999;">
            <div><button class="btn btn-danger" id="close" style="float:right;">X</button></div>
            <div id="info">
                <div>Name: ${user.name}</div>
                <div>Email: ${user.email}</div>
                <div>Premium Subscription: ${hasPremium}</div>
            </div>
        </div>
    `;

    document.body.appendChild(profile);
    document.getElementById('close').onclick = function(e) {
        profile.remove();
    }
}

document.getElementById('logout').onclick = function() {
    localStorage.removeItem('token');
    window.location.href="../auth/login/login.html";
}