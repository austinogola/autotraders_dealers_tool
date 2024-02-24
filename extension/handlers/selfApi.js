const sendMessageToTab =(tabId, message, maxRetries = 20, retryInterval = 500) =>{
    
    return new Promise((resolve, reject) => {
        let retries = 0;

        const sendMessageAttempt = () => {
            if (retries >= maxRetries) {
              console.log(`Maximum retries (${maxRetries}) reached. Message not sent.`);
              console.log(message);
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


const waitFor=(dets,matcher)=>{
    const {url}=dets
             
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){
            let viableUrl=url.includes(matcher)
            if(viableUrl){
                // sendMessageToTab(dets.tabId,{sc:'getMadeBid'})
                console.log(url);
            }
        }
    }
}


const getByIntercept=(matcher,tab_msg)=>{
    return new Promise(async(resolve, reject) => {
        chrome.runtime.onConnect.addListener((port)=>{
            if(port.name=='tab_port'){
                port.onMessage.addListener(async(message,port)=>{
                    if(message.intercept){
                        console.log(message);
                    }
                })
            }
        })
        chrome.webRequest.onCompleted.addListener(dets=>{
            const {url}=dets
            if(dets.initiator){
                if(!(dets.initiator.includes('chrome-extension'))){
                    let viableUrl=url.includes(matcher)
                    if(viableUrl){
                        sendMessageToTab(dets.tabId,{sc:tab_msg})
                        console.log(url);
                    }
                }
            }
        },
        {urls:["https://*.copart.com/*","https://copart.com/*"]},["responseHeaders","extraHeaders"])


    })
}

const getLotsWon=()=>{
    new Promise((resolve, reject) => {
        getByIntercept('/bidStatus/lotsWon','getWonLots')
        chrome.tabs.query({audible:false},tabs=>{
            let copart_tabs=tabs.filter(tab=>tab.url.includes('copart.com'))
            if(copart_tabs[0]){
                sendMessageToTab(copart_tabs[0].id,{iframe:true,url:'https://www.copart.com/lotsWon/'})
            }
        })
    })
}



