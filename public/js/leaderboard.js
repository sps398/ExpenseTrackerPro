let content = document.getElementById('content');
let page;

window.addEventListener('DOMContentLoaded', () => {
    page=1;
    render();
});

function addPaginationBtns(data) {
    const btnsC = document.createElement('div');
    btnsC.id='btnsC';
    btnsC.style.display = 'inline-block';
    btnsC.className = 'w-25 d-flex justify-content-center align-items-center m-auto mt-5';

    if(data.hasPreviousPage) {
        const btn2 = document.createElement('button');
        btn2.innerHTML = data.previousPage;
        btn2.addEventListener('click', (e) => {
            page=e.target.innerHTML;
            render();
        });
        btnsC.appendChild(btn2);
    }

    const btn1 = document.createElement('button');
    btn1.innerHTML = data.currentPage;
    btn1.className = 'mx-2 bg-dark text-white';

    btn1.addEventListener('click', (e) => {
        page=e.target.innerHTML;
        render();
    });
    btnsC.appendChild(btn1);

    console.log(data.hasNextPage);

    if(data.hasNextPage) {
        const btn3 = document.createElement('button');
        btn3.innerHTML = data.nextPage;
        btn3.addEventListener('click', (e) => {
            page=e.target.innerHTML;
            render();
        });
        btnsC.appendChild(btn3);
    }

    content.appendChild(btnsC);
}

async function render() {
    if(document.getElementById('btnsC'))
        document.getElementById('btnsC').remove();

    let result;
    try{
        result = await axiosInstance.get(`/premium/leaderboard?page=${page}`, { headers: { 'Authorization': token } });
    } catch(err) {
        console.log(err);
        return;
    }

    const lbData = result.data.lbData;
    const data = result.data.pageData;
    
    content.innerHTML = '';

    if(lbData.length == 0) {
        content.innerHTML = `
            <h2>Leaderboard Empty</h2>
        `;
        content.className = 'd-flex justify-content-center align-items-center bg-info mt-5 p-5';
        return;
    }

    content.innerHTML = `
        <div class="container mb-4 d-flex flex-column justify-content-center align-items-center col-lg-6 col-9">
            <table id="lbtable" class="table table-hover table-bordered">
                <thead class="text-white" style="font-family: 'Exo 2', sans-serif;background-color: rgb(32,144,158)">
                    <tr>
                        <th class="title col-1">#</th>
                        <th class="title col-lg-3 col-4">Name</th>
                        <th class="title col-lg-3 col-4">Total Savings</th>
                    </tr>    
                </thead>
                <tbody id="lbtable" class="text-dark" style="background-color: #C4C4C4;">
                </tbody>
            </table>
        </div>
    `;

    const tableBody = document.getElementById('lbtable');

    for(let i=0;i<lbData.length;i++) {
        const user = lbData[i];

        tableBody.innerHTML += `
                <tr>
                    <td class="data col-1">${i+1}</td>
                    <td class="data col-lg-3 col-4">${user.name}</td>
                    <td class="data col-lg-3 col-4">${user.totalSavings}</td>
                </tr>
            `;
    }

    addPaginationBtns(data);
}