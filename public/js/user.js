document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.querySelector('#loginBtn');
    const signupBtn = document.querySelector('#signupBtn');
    const recoveryBtn = document.querySelector('#recoveryBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
      }
    
      if (signupBtn) {
        signupBtn.addEventListener('click', signup);
      }
    
      if (recoveryBtn) {
        recoveryBtn.addEventListener('click', password);
      }
    });

async function signup(e){
    e.preventDefault();
    console.log('new user')
    let obj = {
        firstName:document.getElementById("firstName").value,
        lastName:document.getElementById("lastName").value,
        email:document.getElementById("email").value,
        password:document.getElementById("password").value
    };
    let res = await axios.post('/adduser',obj);

    let newdiv = document.createElement("div");
    if(res.data.pass){
        newdiv.className = "alert alert-success";
        window.location.href = 'expense';
    }else{
        newdiv.className = "alert alert-danger";
    }
    
    newdiv.role = "alert";
    let child = document.createElement("p");
    child.textContent = `${res.data.res}`;
    newdiv.appendChild(child);
    let warning = document.getElementById("warning")
    warning.appendChild(newdiv);
}
async function login(e){
    console.log('login process')
    e.preventDefault();
    let obj = {
        email:document.getElementById("email").value,
        password:document.getElementById("password").value
    }
    console.log(obj)
    let res = await axios.post('/login',obj)
    localStorage.setItem('token',res.data.token)
    let newdiv = document.createElement("div");
    if (res.data.pass){
        newdiv.className = "alert alert-success";
        window.location.href = 'expense';
    }else{
        newdiv.className = "alert alert-danger"
    }
    
    newdiv.role = "alert";
    let child = document.createElement("p");
    child.textContent = `${res.data.res}`;
    newdiv.appendChild(child);
    let warning = document.getElementById("warning")
    warning.appendChild(newdiv);
    
}

async function password(e){
    e.preventDefault();
    let obj = {
        email:document.getElementById("email").value
    }
    let newdiv = document.createElement("div");
    newdiv.className = "alert alert-success";
    newdiv.role = "alert";
    let child = document.createElement("p");
    child.textContent = 'Account Recovery - Password Reset Link has been sent to your mail.';
    newdiv.appendChild(child);
    let warning = document.getElementById("warning")
    warning.appendChild(newdiv);
    try{
        let res = await axios.post('/forgotpassword',obj)
        localStorage.setItem("userToken",res.data.userToken);
        localStorage.setItem("passwordToken",res.data.passwordToken);

    }
    catch(err){
        console.log(err);
    }    
}

