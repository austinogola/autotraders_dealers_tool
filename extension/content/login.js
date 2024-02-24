
const  loadSelector=async(selector,all)=> {
    var raf;
    var found = false;
    let el
    let elAll

    return new Promise((resolve,reject)=>{
        (function check(){
           
                
                el=$(selector)[0]
                elAll=$(selector)
                
            if (el) {
                found = true;
                cancelAnimationFrame(raf);
                all?resolve(elAll):resolve(el)
                
                if(!found){
                raf = requestAnimationFrame(check);
                }
                
            
            } else {
                raf = requestAnimationFrame(check);
            }
            })();
    })   
}
const loginToCopart=async(userN,pwd,num)=>{
    const username_input = await loadSelector("#username");
    const password_input = await loadSelector("#password");
    const loginBtn= await loadSelector('button[data-uname="loginSigninmemberbutton"]')
    username_input.setAttribute("autocomplete", "off");
    username_input.setAttribute("type", "password");
    password_input.setAttribute("autocomplete", "off");
    console.log(loginBtn);
    chrome.storage.local.remove('selected_copart_account')
   

    username_input.value=userN
    username_input.dispatchEvent(
        new Event("input", {
            view: window,
            bubbles: true,
            cancelable: true,
        })
    );
    
    password_input.value=pwd
    password_input.dispatchEvent(
        new Event("input", {
            view: window,
            bubbles: true,
            cancelable: true,
        })
    );

    chrome.storage.local.set({copart_member_number:num},res=>{
        loginBtn.click()
    })
    
    
}
if(window.location.href.includes('/login')){
    chrome.storage.local.get('selected_copart_account').then(result=>{
        if(result.selected_copart_account){
            let accPassword=result.selected_copart_account.password
            let accUsername=result.selected_copart_account.username
            let member_number=result.selected_copart_account.member_number
            loginToCopart(accUsername,accPassword,member_number)
        }
    })
}

