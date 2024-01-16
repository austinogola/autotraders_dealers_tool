const popup_port=chrome.runtime.connect({name: "popup_port"});

popup_port.onMessage.addListener((msg)=>{
    if(msg.signResult){
        
    }
})

const signInForm=document.querySelector("form")
const usernameField=document.querySelector("input#username")
const passwordField=document.querySelector("input#password")

signInForm.addEventListener('submit',e=>{
    e.preventDefault()
    const username=usernameField.value
    const password=passwordField.value
    popup_port.postMessage({dealerSign:true,password,username})
})