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
            // console.log(copartCreds);
            if(copartCreds.success){
                let {profile}=copartCreds
                chrome.storage.local.set({ copartProfile: profile })
            }
        }
        if(message.signInTo){
            clearCopart()
            const selected_copart_account=message.signInTo
            chrome.storage.local.set({ selected_copart_account }).then(() => {
                console.log("copart account chosen: ",selected_copart_account);
                chrome.tabs.create({url:'https://www.copart.com/login/'})
              });
        }
        if(message.signOut){
            clearCopart()
            chrome.storage.local.set({ copartProfile: {} })
            chrome.storage.local.remove('copart_member_number')
            // chrome.storage.local.set({ selected_copart_account })
            // console.log(message);
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

const  clearCopart=()=>{

    chrome.browsingData.remove({
        "origins": ["https://www.copart.com"]
    }, {
        "cacheStorage": true,
        "cookies": true,
        "fileSystems": true,
        "indexedDB": true,
        "localStorage": true,
        "serviceWorkers": true,
        "webSQL": true
    }, console.log);

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
// chrome.cookies.onChanged.addListener((changeInfo)=>{
//     let ck=changeInfo.cookie
//     let copartCks=ck.domain.includes('copart') && (ck.name=='G2JSESSIONID' || ck.name=='JSESSIONID')
//     if(copartCks){
//         // console.log(changeInfo);
//     }
// })

let reqHeaders={}

const makeCurrentHeaders=(headersArr)=>{
    headersArr.forEach(item=>{
        reqHeaders[item.name]=item.value
    })
}

const duplicateRequest=(requestDetails)=>{
    let {url,requestHeaders,method}=requestDetails
    
    let heads={}
    requestHeaders.forEach(val=>{
        heads[val.name]=val.value
    })

    
    fetch(url,{method:method,headers:heads})
    .then(async res=>{
        if(res.status==200){
            let resBody=await res.json()
            console.log(url,resBody);

        }else{
            console.log(`Error duplicating ${url} `);
        }

    })
    .catch(err=>{
            console.log('error',`(${url})`,err.message);
    })


   
}


chrome.webRequest.onBeforeSendHeaders.addListener((dets)=>{

    const {url}=dets
    
    // if(dets.method='POST' && dets.requestHeaders){
    //     dets.requestHeaders.forEach(item=>{
    //         if(item.name=='X-XSRF-TOKEN'){
    //             makeCurrentHeaders(dets.requestHeaders)
    //             return
    //             console.log(dets);
    //             console.log(item);
    //         }
    //     })
    // } 
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){


            if(url.includes('/data/lots/') || 
            url.includes('public/data/contactinfo') ||
            url.includes('data/member/account/alerts') ||
            url.includes('public/data/userConfig')){
                duplicateRequest(dets)
            }
        }
        
    }
    
    
},{urls:["https://*.copart.com/*","https://copart.com/*"]},["requestHeaders","extraHeaders"])

let times

// https://www.copart.com/data/lots/watchList

// https://www.copart.com/data/bidder-numbers

// https://www.copart.com/data/lots/myBids/286042/0