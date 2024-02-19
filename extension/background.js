importScripts(
    "handlers/bidHandler.js",
    "handlers/apiHandler.js",
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
    clearCopart()
    chrome.storage.local.clear()
})

let MEMBER_NUMBER


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
            // console.log(copartCreds);
            
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
                if(url.includes('lots/prelim-bid') || url.includes('lots/live-bid') ){
                    console.log('Prebid made',intercepted);
                    handleNewBid(intercepted)
                    return
                    handleRecentBid(intercepted)

                }
                else if(url.includes('/lotdetails')){
                    console.log('Adding lot details');
                    console.log(intercepted);
                    return
                    handleBids(data,url,timestamp)

                }
                else if(url.includes('lots/prelim-bid')){

                }
            }

          
            // console.log(message);
        }
    })
})






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

const sendMessageToTab =(tabId, message, maxRetries = 20, retryInterval = 500) =>{
    
    return new Promise((resolve, reject) => {
        let retries = 0;

        const sendMessageAttempt = () => {
            if (retries >= maxRetries) {
              console.log(`Maximum retries (${maxRetries}) reached. Message not sent.`);
              resolve('NOT SENT')
              return;
            }
        
            chrome.tabs.sendMessage(tabId, message, response => {
              if (chrome.runtime.lastError) {
                // console.error(chrome.runtime.lastError.message);
                retries++;
                setTimeout(sendMessageAttempt, retryInterval);
              }
              else{
                  resolve('MESSAGE SENT')
                  return
              }
            });
        };

        sendMessageAttempt();
    })
    
  }





chrome.webRequest.onBeforeSendHeaders.addListener((dets)=>{
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){
            makeCurrentHeaders(dets)
        }
    }

},{urls:["https://*.copart.com/*","https://copart.com/*"]},["requestHeaders","extraHeaders"])



chrome.webRequest.onCompleted.addListener((dets)=>{

    const {url}=dets
     
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){

            let viableUrl=url.includes('lots/prelim-bid') || url.includes('lots/live-bid') 
            || (url.includes('userConfig') )
          

            if(viableUrl){
                if(url.includes('lots/prelim-bid')|| url.includes('lots/live-bid') ){
                    sendMessageToTab(dets.tabId,'getMadeBid')
                }
                else if(url.includes('userConfig') ){
                    checkCurrentBids(new Date().getTime())
                
                    
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