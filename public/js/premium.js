const premBtnC = document.getElementById('prembtnc');
const premBtn = document.getElementById('prembtn');

(function renderPremiumFeatures() {
    const isPremium = user.isPremium;

    if (isPremium) {
        premBtnC.style.display = 'none';
        document.getElementById('userprofilebtn').innerHTML += ` <i class="fa-solid fa-star text-warning"></i>`;
        document.getElementById('charts').onclick = function() {
            alert('Coming soon!');
        }
    }
    else {
        const views = [ 'leaderboard', 'charts', 'downloads' ];
        for(let view of views) {
            const currView = document.getElementById(view);
            currView.href="#";
            currView.onclick = renderBuyPremiumMessage;
        }
    }
})();

function renderBuyPremiumMessage() {
    alert('Buy premium to access this feature');
}

premBtn.onclick = async function (e) {
    try {
        var response = await axiosInstance.get('/purchase/premiumMembership', { headers: { 'Authorization': token } });
        console.log(response);
    } catch (err) {
        console.log(err);
        return;
    }

    const options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {
            try {
                const result = await updateTransactionStatus(options.order_id, response.razorpay_payment_id);
    
                alert(result.data.message);
                alert('You are premium user now.');
    
                localStorage.setItem('token', result.data.token);
                location.reload();
            } catch(err) {
                alert('Something went wrong!', err);
            }
        },
        "modal": {
            "ondismiss": async function() {
                try {
                    const result = await updateTransactionStatus(options.order_id, null);
                    alert(result.data.message);
                    location.reload();
                } catch(err) {
                    alert('Something went wrong!', err);
                }
            }
        }
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', async function (response) {
        try {
            const result = await updateTransactionStatus(options.order_id, null);
            alert(result.data.message);
            location.reload();
        } catch(err) {
            alert('Something went wrong!', err);
        }
    });
}

async function updateTransactionStatus(order_id, payment_id) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await axiosInstance.post('http://localhost:3000/purchase/updatetransactionstatus', {
                    order_id: order_id,
                    payment_id: payment_id
                }, { headers: { 'Authorization': token } });
            resolve(result);
        } catch(err) {
            reject(err.response);
        }
    })
}