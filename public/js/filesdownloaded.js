let content = document.getElementById('content');

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000'
});

window.addEventListener('DOMContentLoaded', () => {
    render();
});

async function render() {
    const token = localStorage.getItem('token');
    let result;
    try {
        result = await axiosInstance.get('/user/filesdownloaded', { headers: { 'Authorization': token } });
    } catch (err) {
        console.log(err);
        // return;  
    }

    const filesData = result.data.filesData;

    console.log(filesData);

    content.innerHTML = '';

    if (filesData.length == 0) {
        content.innerHTML = `
            <h2>No files downloaded</h2>
        `;
        content.className = 'd-flex justify-content-center align-items-center bg-info mt-5 p-5';
        return;
    }

    let fileUrls = [];

    content.innerHTML = `
        <div class="container mb-4 d-flex flex-column justify-content-center align-items-center">
                        <table id="expenses-table" class="table text-white table-hover table-bordered">
                            <thead class="mb-5" style="font-family: 'Exo 2', sans-serif;background-color: rgb(32,144,158)">
                                <tr class="mt-5">
                                    <th class="title col-1">#</th>
                                    <th class="title col-lg-3 col-4">Date (dd/mm/yyyy)</th>
                                    <th class="title col-lg-3 col-4">Time (hr:min:sec)</th>
                                    <th class="title col-lg-1 col-2"></th>
                                </tr>    
                            </thead>
                            <tbody id="expenses-table-body" class="body  text-dark">
                                
                            </tbody>
                        </table>
            </div>
    `;

    const tableBody = document.getElementById('expenses-table-body');

    for (let i = 0; i < filesData.length; i++) {
        const file = filesData[i];

        fileUrls.push(file.fileUrl);

        const date = new Date(file.dateDownloaded);

        tableBody.innerHTML += `
            <tr class="mt-5">
                <td class="data col-1">${i+1}</td>
                <td class="data col-lg-3 col-4">${date.getDate()}/${date.getMonth()}/${date.getFullYear()}</td>
                <td class="data col-lg-3 col-4">${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</td>
                <td class="data col-lg-1 col-lg-1 col-2"><i id="btn${i+1}" class="download btn fa-solid fa-download text-dark"></i></td>
                </tr>
                `;
    }

    const downloadBtns = document.getElementsByClassName('download');

    for (let i = 0; i < downloadBtns.length; i++) {
        const fileUrl = fileUrls[i];

        document.getElementById('btn' + (i + 1)).onclick = function download(file) {
            try {
                const z = document.createElement('a');
                z.href = fileUrl;
                z.click();
            } catch (err) {
                console.log(err);
                alert('Something went wrong!');
            }
        }
    }
}

function callDownload(file) {
    download(file);
}