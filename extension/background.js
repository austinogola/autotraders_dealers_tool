importScripts(
    "bg/loginCtrl.js",
)

const HOST=`http://127.0.0.1:8000/`
const DOMAIN=`127.0.0.1`


chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{

})

chrome.runtime.onConnect.addListener((port)=>{
    port.onMessage.addListener(async(message,port)=>{
        if(message.dealerSign){
            let {username,password}=message
            let copartCreds=await dealerSignIn(username,password)
            port.postMessage({dealerStatus:copartCreds})
            console.log(copartCreds);
            if(copartCreds.success){
                let {profile}=copartCreds
                chrome.storage.local.set({ copartProfile: profile }).then(() => {
                    console.log("copartProfile Value is set to",profile);
                  });
            }
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

const getCopartCookies=()=>{
    return new Promise(async(resolve, reject) => {
        chrome.cookies.getAll({name:'csrftoken',domain:'www.copart.com'},cks=>{
            let cookieString=''
            cks.forEach(cookie => {
                // headers[cookie.name]=cookie.value
                cookieString+=`${cookie.name}=${cookie.value};`
            });
            resolve(cookieString)
        })
    })
}


const copartSignIn=()=>{
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
//JSESSIONID
chrome.cookies.onChanged.addListener((changeInfo)=>{
    let ck=changeInfo.cookie
    let copartCks=ck.domain.includes('copart') && (ck.name=='G2JSESSIONID' || ck.name=='JSESSIONID')
    if(copartCks){
        // console.log(changeInfo);
    }
})

