const passwordBtn = form1.querySelector("#resetPassword");
passwordBtn.addEventListener("click",passwordreset);

async function resetPassword(e){
    e.preventDefault();
    const userToken = localStorage.getItem("userToken");
    const passwordToken = localStorage.getItem("passwordToken");
    try{
        let page  = await axios.post('/password',{headers:{"userAuthorization":userToken,"passwordAuthorization":passwordToken}});
    }
    catch(err){
        console.log(err)
    }
}


async function passwordreset(e){
    e.preventDefault();
    const userToken = localStorage.getItem("userToken");
    const passwordToken = localStorage.getItem("passwordToken");

    try{
        const newpassword = document.getElementById('newpassword').value;
        const renewpassword = document.getElementById('renewpassword').value;
        if(newpassword===renewpassword){
            let obj = {
                email:document.getElementById('email').value,
                password:newpassword,
            }

            let reset = await axios.post(`/resetpassword`,obj,{headers:{"userAuthorization":userToken,"passwordAuthorization":passwordToken}})
            if(reset.status===200){
                let newdiv = document.createElement("div");
                newdiv.className = "alert alert-success";
                newdiv.role = "alert";
                let child = document.createElement("p");
                child.textContent = 'Your password has been reset :)';
                newdiv.appendChild(child);
                let warning = document.getElementById("warning")
                warning.appendChild(newdiv);
                let btn1 = document.getElementById('loginBtn');
                btn1.style.visibility = 'visible';
            }
        }else{
            
            alert("password dont match");
        }
    }
    catch(err){
        console.log(err)
    }
}
