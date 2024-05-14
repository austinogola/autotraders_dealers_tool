importScripts(
    "handlers/bidHandler.js",
    "handlers/apiHandler.js","handlers/selfApi.js",
)

// const HOST=`http://127.0.0.1:8000/`
const HOST=`http://3.78.251.248:3000/`
// const DOMAIN=`127.0.0.1`
const DOMAIN=`3.78.251.248`

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

chrome.runtime.onInstalled.addListener(async(dets)=>{
    // clearCopart()
    // chrome.storage.local.clear()
})

let member_number


chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
    if(request=='stimulate buy'){
        makefakeBid()
    }
    
})
let tab_port
let popup_port
chrome.runtime.onConnect.addListener((port)=>{
    if(port.name=='tab_port'){
        tab_port=port
    }

    port.onMessage.addListener(async(message,port)=>{
        
        if(message.dealerSign){
            
            let {username,password}=message
            let copartCreds=await dealerSignIn(username,password)
            handleCopDetails(copartCreds,username,password)
            
            // port.postMessage({dealerStatus:copartCreds})
            // console.log(copartCreds);
            if(copartCreds.success){
                let {profile}=copartCreds
                chrome.storage.local.set({ bidderProfile: profile })
            }else{
                let {message}=copartCreds
                chrome.storage.local.set({ bidderMessage: message })
            }
        }
        if(message.signInTo){
            clearCopart()
            const selected_copart_account=message.signInTo
            chrome.storage.local.set({ selected_copart_account }).then(() => {
                // console.log("copart account chosen: ",selected_copart_account);
                chrome.tabs.create({url:'https://www.copart.com/login/?redirectUrl=%2FlotsWon%2F'})
              });
        }
        if(message.signOut){
            clearCopart()
            // chrome.storage.local.set({ copartProfile: {} })
            chrome.storage.local.clear()
            // chrome.storage.local.set({ selected_copart_account })
            // console.log(message);
        }
        if(message.intercepted){
            let intercepted=message.intercepted
            const {data,url,postData,timestamp}=intercepted

            if(url){
                if(url.includes('lots/prelim-bid') ){
                    handleNewBid(intercepted)

                }
                else if(url.includes('g2auction.copart.com/g2/authenticate/api/v1/sale/messages')){
                    console.log('live bid',intercepted);
                }
            }

          
            // console.log(message);
        }
    })
})

chrome.tabs.onUpdated.addListener((tabId,changeInfo)=>{
    if(changeInfo.url && changeInfo.url.includes('copart.com')){
        sendMessageToTab(tabId,'check views')
    }
})



const handleCopDetails=(copartCreds,us,pwd)=>{
    const {profile,success}=copartCreds
    const {max_bid}=profile

    const MAX_BID=parseInt(max_bid)
    chrome.storage.local.set({MAX_BID:max_bid,USERNAME:us,PWD:pwd})

}

const dealerSignIn=(username,password)=>{
    return new Promise(async(resolve, reject) => {
        let params=`?u=${username}&p=${password}`
        // let body=JSON.stringify({username,password}).slice(1,-1);
        let body={username,password}
        
        let fullUrl=`auth/signin${params}`
        let response = await apiFetch(fullUrl,'GET')
        resolve(response)
       
        

       
    })
}

    
// chrome.storage.local.set({lotDatas})



const sleep=(ms)=>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve
        }, ms);
    })
}


const Copart_Headers={}


const makeCurrentHeaders=(requestDetails)=>{
    let {url,requestHeaders,method,initiator}=requestDetails
    // return
    requestHeaders.forEach(val=>{
        Copart_Headers[val.name]=val.value
        
    })
   
}





const duplicateRequest=(dets)=>{
    let {url,requestHeaders,method,initiator}=dets
    // return
    let headers={}
    requestHeaders.forEach(val=>{
        headers[val.name]=val.value
    })
    fetch(url,{
        method
    })

}

chrome.webRequest.onBeforeSendHeaders.addListener((dets)=>{
    const {url}=dets
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){
            makeCurrentHeaders(dets)
            if(url.includes('lotsWon')){
                // duplicateRequest(dets)
            }
        }
        
    }

},{urls:["https://*.copart.com/*","https://copart.com/*"]},["requestHeaders","extraHeaders"])



chrome.webRequest.onCompleted.addListener((dets)=>{

    const {url}=dets
     
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){
            
            
          

            let bidUrl=url.includes('lots/prelim-bid') || url.includes('g2auction.copart.com/g2/authenticate/api/v1/sale/messages')
            if(bidUrl){
                sendMessageToTab(dets.tabId,{sc:'getMadeBid'})
            }
            if(url.includes('userConfig') ){
                checkCurrentBids(new Date().getTime()) 
            }

            if(false){
                if(url.includes('lots/prelim-bid')|| url.includes('lots/live-bid') ){
                    sendMessageToTab(dets.tabId,{sc:'getMadeBid'})
                }
                else if(url.includes('userConfig') ){
                    checkCurrentBids(new Date().getTime()) 
                }
                else if(url.includes('lot') ){
                    console.log(url);
                }
                // console.log('Viable');
                // chrome.storage.local.get(['copart_member_number'],res=>{
                //     if(res.copart_member_number){
                //         MEMBER_NUMBER=res.copart_member_number
                //         makeCurrentHeaders(dets)
                        
                //         if(url.includes('lots/prelim-bid')){
                //             sendMessageToTab(dets.tabId,'getMadeBid')
                //         }else{
                //             sendMessageToTab(dets.tabId,'getIntercepted')
                //         }

                        
                        

                //     }
                // })
                
            }
        }
        
    }
    
    
},{urls:["https://*.copart.com/*","https://copart.com/*"]},["responseHeaders","extraHeaders"])

let times

// ["requestHeaders","extraHeaders"]

// https://www.copart.com/data/lots/watchList

// https://www.copart.com/data/bidder-numbers

// https://www.copart.com/data/lots/myBids/286042/0