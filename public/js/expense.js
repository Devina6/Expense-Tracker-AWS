let token = localStorage.getItem('token');
const buttons = {
    expenseGeneralBtn : form1.querySelector("#expenseGeneral"),
    rowsBtn : form2.querySelector("#rows")
}
buttons.expenseGeneralBtn.addEventListener("click",expense);
buttons.rowsBtn.addEventListener("click",rowPerPage);

window.onload = async() => {
    try{
        
        const response1 = await axios.get('/purchase/ispremium',{headers:{"userAuthorization":token}})
        localStorage.setItem("rowsPerPage",3)
        await getExpenses(1);
        if(response1.data){
            let data = document.getElementById('premiumdata');
            data.textContent = "You are a PREMIUM User!"
            let btn1 = document.getElementById('leaderBtn');
            btn1.style.visibility = 'visible';
            let btn2 = document.getElementById('expenseBtn');
            btn2.style.visibility = 'visible';
        }
        else{
            let btn = document.getElementById('razorpayBtn');
            btn.style.visibility = 'visible';
        }
    }
    catch(err){
        console.log(err)
    }
}

async function rowPerPage(e){
    e.preventDefault();
    const row = document.getElementById('rows').value;
    console.log(row);
    localStorage.setItem("rowsPerPage",`${row}`)
    await getExpenses(1);
}

function showPagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage
}) {
    const nextBtn = document.getElementById('next')
    const previousBtn = document.getElementById('previous')
    const currentBtn = document.getElementById('current')
    currentBtn.value = currentPage;

    if (hasNextPage) {
        nextBtn.disabled = false;
        nextBtn.addEventListener('click',() => getExpenses(nextPage))
    } else {
        nextBtn.disabled = true;
    }

    if (hasPreviousPage) {
        previousBtn.disabled = false;
        previousBtn.addEventListener('click',() => getExpenses(previousPage))
    } else {
        previousBtn.disabled = true;
    }
}


async function getExpenses(page){
    try{
        let rows = parseInt(localStorage.getItem('rowsPerPage'))
        let obj = {
            rows:rows
        }
        const { data: { expenses, ...pageData } }  = await axios.post(`/expense/index?page=${page}`,obj,{headers:{"userAuthorization": token } })
        let clearData = document.getElementById('tableBody');
        while (clearData.firstChild) {
            clearData.removeChild(clearData.firstChild);
        }
        displayExpense(expenses)
        showPagination(pageData)
    }catch(err){
        console.log(err)
    }

}
    
async function expense(e){
    e.preventDefault();
    let obj = {
        amount:document.getElementById("amount").value,
        description:document.getElementById("description").value,
        category:document.getElementById("category").value
    }
    try{
        const result = await axios.post('/expense/addExpense',obj,{headers:{"userAuthorization":token}})
        displayExpense(result.data.expense);
        window.location.reload();
       
    }
    catch(err){
        console.log(err)
    } 
}

function displayExpense(expenses){
    for (var i = 0; i < expenses.length; i++) {
        let parentTBody = document.getElementById('tableBody');
        let childTRow = document.createElement('tr');
        let childTRHData1 = document.createElement('td');
        let childTRHData2 = document.createElement('td');
        let childTRHData3 = document.createElement('td');
        childTRow.setAttribute('data-key',expenses[i].id);
        childTRHData1.textContent = expenses[i].amount
        childTRHData2.textContent = expenses[i].description
        childTRHData3.textContent = expenses[i].category
        parentTBody.appendChild(childTRow);
        childTRow.appendChild(childTRHData1)
        childTRow.appendChild(childTRHData2)
        childTRow.appendChild(childTRHData3)
        
        let newdiv = document.createElement('div');
        newdiv.className = "btn-group";
        let deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger delete';
        deleteBtn.appendChild(document.createTextNode('Remove'));
        newdiv.appendChild(deleteBtn);
        childTRow.appendChild(newdiv);
    }
    
}

var tBody = document.getElementById('tableBody');
tBody.addEventListener('click',removeItem);

async function removeItem(e){
    if(e.target.classList.contains('delete')){
        if(confirm('Are you sure?')){
            
            let tRow = e.target.parentElement.parentElement;
            const _id = e.target.parentElement.parentElement.getAttribute('data-key');
            let url = "/expense/delete/"+ _id
            try{
                let del = await axios.get(url,{headers:{"userAuthorization":token}})
                tBody.removeChild(tRow);
                window.location.reload;
            }
            catch(err){
                console.log(err)
            }
            
        }
    }
}

async function premium(e){
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    await axios.get('/purchase/premiummembership',{headers:{"userAuthorization":token}})
            .then(response => {
                let orderid = response.data.order.id;
                let options = {
                    key:response.data.key_id, //Enter the key ID generated from the dashboard
                    order_id:response.data.order.id, //for one time payment
                    //this handler function will handle the success payment
                    handler:async function (response){
                        try{
                            
                            await axios.post('/purchase/updatetransactionstatus',{
                                order_id:options.order_id,
                                payment_id:response.razorpay_payment_id,
                        },
                        {
                            headers:{"userAuthorization":token}
                        })
                        .then((result)=>{
                            let btn = document.getElementById('razorpayBtn');
                            btn.style.visibility = 'hidden';
                            //alert("You are a PREMIUM user now");
                            let data = document.getElementById('premiumdata');
                            data.textContent = "You are now a PREMIUM User!"
                            let btn1 = document.getElementById('leaderBtn');
                            btn1.style.visibility = 'visible';
                            let btn2 = document.getElementById('expenseBtn');
                            btn2.style.visibility = 'visible';

                        })
                        .catch(err => console.log(err))
                        }
                        catch(err){
                            console.log(err);
                        }
                        
                    },
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
                e.preventDefault();
                rzp1.on('payment.failed',async function(response1){
                   try{
                        
                        await axios.post('/purchase/updatetransactionstatus',{
                            order_id:orderid,
                            payment_id:"00000000"
                        },{
                            headers:{"userAuthorization":token}
                        })
                        .then(result1 => {
                            alert('Transaction Failure, not a premium user');
                        }) 
                   }
                   catch (err){
                    console.log(err)
                   }      
                })    
            })
            .catch(err => console.log(err))
}

async function leaderBoard(e){
    e.preventDefault();
    axios.get('/premium/leaderboardstatus')
        .then(lists => {
            let parent = document.getElementById('leaderOrder');
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
            lists.data.forEach(list => {
                displayStatus(list)
            })
            
        })
        .catch(err => console.log(err));
}

function displayStatus(list){
    let parent = document.getElementById('leaderOrder');
    let child = document.createElement('li');
    child.textContent =`${list.firstName}`+" "+`${list.lastName}`+" ---> "+`${list.totalExpense}`;
    parent.appendChild(child);
    
}

