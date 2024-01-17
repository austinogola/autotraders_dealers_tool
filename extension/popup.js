const popup_port=chrome.runtime.connect({name: "popup_port"});

const signInForm=document.querySelector("form")
const usernameField=document.querySelector("input#username")
const passwordField=document.querySelector("input#password")
const copart_select=document.querySelector("select")

const homePage=document.querySelector("div.homePage")
const exitBtn=document.querySelector("button#exitBtn")

const errorSpan=document.querySelector('#errorSpan')

let copartAccounts
let selected_copart_account

const handle_copart_ui=()=>{
    chrome.storage.local.get(["copartProfile",'selected_copart_account']).then((result) => {
        if(result.copartProfile && Object.keys(result.copartProfile).includes('accounts')){
            signInForm.style.display='none'
            homePage.style.display='block'
            copartAccounts=[...result.copartProfile.accounts]
            copartAccounts.forEach(item=>{
                if(item.active==true){
                    let opt = document.createElement('option');
                    opt.value=item.member_number
                    opt.innerHTML=item.member_number
                    copart_select.appendChild(opt);
                }
            })
        }else{
            signInForm.style.display='block'
            homePage.style.display='none'
        }
    });
}

handle_copart_ui()



chrome.storage.onChanged.addListener((changes, namespace) => {
    if(changes.copartProfile){
        let cop=changes.copartProfile.newValue
        if(cop && Object.keys(cop).includes('accounts')){;
            handle_copart_ui()
        }else{
            signInForm.style.display='block'
            homePage.style.display='none'
        }
        
    }
  });



signInForm.addEventListener('submit',e=>{
    e.preventDefault()
    const username=usernameField.value
    const password=passwordField.value
    popup_port.postMessage({dealerSign:true,password,username})
})

exitBtn.addEventListener('click',e=>{
    e.preventDefault()
    chrome.storage.local.set({ copartProfile: {} })
    signInForm.style.display='block'
    homePage.style.display='none'
})

copart_select.addEventListener('change',e=>{
    e.preventDefault()
    let value=e.target.value
    if(value.length>1){
        value=parseInt(value)
        selected_copart_account=copartAccounts.filter(item=>item.member_number==value)[0]
        chrome.storage.local.set({ selected_copart_account })
    }
})


popup_port.onMessage.addListener((msg)=>{
    if(msg.dealerStatus){
        if(msg.dealerStatus.success){

        }else{
            errorSpan.textContent=msg.dealerStatus.message
            errorSpan.style.display='block'
            usernameField.style.border='1px solid #DD263E'
            passwordField.style.border='1px solid #DD263E'
        }

    }
})
