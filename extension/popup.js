const popup_port=chrome.runtime.connect({name: "popup_port"});

const signInForm=document.querySelector("form")
const usernameField=document.querySelector("input#username")
const passwordField=document.querySelector("input#password")
const copart_select=document.querySelector("select")

const homePage=document.querySelector("div.homePage")
const errorSpan=document.querySelector('#errorSpan')

const exitBtn=document.querySelector("button#exitBtn")
const openBtn=document.querySelector('#openBtn')

const name1=document.querySelector('.welcome h3')

let copartAccounts
let selected_copart_account

const handle_copart_ui=()=>{
    chrome.storage.local.get(["copartProfile",'selected_copart_account',
    'copart_member_number','usernameInput','passwordInput']).then((result) => {
        if(result.copartProfile && Object.keys(result.copartProfile).includes('accounts')){
            signInForm.style.display='none'
            homePage.style.display='block'
            if(result.copartProfile.username){
                name1.innerText=result.copartProfile.username
            }
            copartAccounts=[...result.copartProfile.accounts]
            copartAccounts.forEach(item=>{
                if(item.active==true){
                    let opt = document.createElement('option');
                    opt.value=item.member_number
                    opt.innerHTML=item.member_number
                    copart_select.appendChild(opt);
                    console.log(opt.value,result.copart_member_number);
                    if(result.copart_member_number && opt.value==result.copart_member_number){
                        opt.selected=true
                    }

                }
            })
            
        }else{
            signInForm.style.display='block'
            homePage.style.display='none'
            result.usernameInput?usernameField.value=result.usernameInput:null
            result.passwordInput?passwordField.value=result.passwordInput:null
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

  usernameField.addEventListener('change',evt=>{
    chrome.storage.local.set({usernameInput:evt.target.value})
  })
  passwordField.addEventListener('change',evt=>{
    chrome.storage.local.set({passwordInput:evt.target.value})
  })




const loginToCopartAccount=(val)=>{
    selected_copart_account=copartAccounts.filter(item=>item.member_number==val)[0]
    // console.log(selected_copart_account);
    chrome.storage.local.set({ selected_copart_account })
    popup_port.postMessage({signInTo:selected_copart_account})
}
const signOutOfProfile=()=>{
    chrome.storage.local.set({ copartProfile: {} })
    signInForm.style.display='block'
    homePage.style.display='none'
    selected_copart_account={}
    chrome.storage.local.set({ selected_copart_account })
    popup_port.postMessage({signOut:true})
}

signInForm.addEventListener('submit',e=>{
    e.preventDefault()
    const username=usernameField.value
    const password=passwordField.value
    popup_port.postMessage({dealerSign:true,password,username})
})

exitBtn.addEventListener('click',e=>{
    e.preventDefault()
    signOutOfProfile()
})
openBtn.addEventListener('click',e=>{
    e.preventDefault()
    let value=copart_select.value
    if(value.length>1){
        value=parseInt(value)
        loginToCopartAccount(value)
    }
})

copart_select.addEventListener('change',e=>{
    e.preventDefault()
})


popup_port.onMessage.addListener((msg)=>{
    if(msg.dealerStatus){
        const {dealerStatus}=msg
        console.log(dealerStatus);
        if(dealerStatus.success){

        }
        // else if(dealerStatus.error){
        //     console.log(dealerStatus);
        // }
        else{
            errorSpan.textContent=dealerStatus.message
            errorSpan.style.display='block'
            usernameField.style.border='1px solid #DD263E'
            passwordField.style.border='1px solid #DD263E'
        }

    }
})
