const HOST=`http://127.0.0.1:8000/`
const DOMAIN=`127.0.0.1`


chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{

})

chrome.runtime.onConnect.addListener((port)=>{
    port.onMessage.addListener(async(message,port)=>{
        if(message.dealerSign){
            let {username,password}=message
            let copartCreds=await dealerSignIn(username,password)
            console.log(copartCreds);
        }
    })
})


const getCsrfToken=()=>{
    return new Promise(async(resolve, reject) => {
        chrome.cookies.getAll({name:'csrftoken',domain:DOMAIN},ck=>{
            resolve (ck[0].value)
        })
    })
}


const signToCopart=()=>{
    return new Promise((resolve, reject) => {
        
    })
}




const dealerSignIn=(username,password)=>{
    return new Promise(async(resolve, reject) => {
        let csrfToken=await getCsrfToken()
        let params=`u=${username}&p=${password}`
        fetch(HOST+'auth/signin',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'X-CSRFToken': csrfToken
            },
            body:JSON.stringify({username,password})
        }).then(async response=>{
            let res=await response.json()
            if(response.status==200){
                resolve(res)
            }
            
        })
    })
}

// dealerSignIn('austin','austin254')