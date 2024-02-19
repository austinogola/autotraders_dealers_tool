
chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    
    if(request=='getIntercepted'){
        sendResponse('Connecting')
        const tab_port=chrome.runtime.connect({name: "tab_port"});
        let intercepted=JSON.parse(localStorage.getItem('intercepted_EXT'))
        if(Object.keys(intercepted).length<1){
            setTimeout(() => {
                let intercepted=JSON.parse(localStorage.getItem('intercepted_EXT'))
                tab_port.postMessage({intercepted})
                
            }, 10000);
        }else{
            tab_port.postMessage({intercepted})
        }
    }else if(request=='getMadeBid'){
        sendResponse('Connecting')
        const tab_port=chrome.runtime.connect({name: "tab_port"});
        let intercepted=JSON.parse(localStorage.getItem('recent_BID'))
        if(Object.keys(intercepted).length<1){
            setTimeout(() => {
                let intercepted=JSON.parse(localStorage.getItem('recent_BID'))
                tab_port.postMessage({intercepted})
                
            }, 5000);
        }else{
            tab_port.postMessage({intercepted})
        }
    }else if(request.saveLot){
        sendResponse('Connecting')
        const lotId=request.saveLot
        const tab_port=chrome.runtime.connect({name: "tab_port"});
        let allSavedLots=JSON.parse(localStorage.getItem('all_saved_lots'))

        let newAllSaveLots=removeDuplicateUrls(allSavedLots)

        newAllSaveLots.length>15?newAllSaveLots.shift():null

        
        localStorage.setItem('all_saved_lots', JSON.stringify(newAllSaveLots));
        console.log(newAllSaveLots);



        let  lotsToSave=newAllSaveLots.filter(item=>item.url.includes(lotId))

        if(lotsToSave[0]){
            chrome.storage.local.get(['savedLots'],res=>{
                let savedLots=[]
                if(res.savedLots){
                    savedLots=[...res.savedLots,...lotsToSave]
                }else{
                    savedLots=[...lotsToSave]
                }
                savedLots=removeDuplicateUrls(savedLots)
                chrome.storage.local.set({ savedLots: savedLots })
    
                console.log(savedLots);
            })
            
        }
        
      
        

        // let current_saved_lots=localStorage.getItem('current_saved_lots')?
        // JSON.parse(localStorage.getItem('current_saved_lots')):[]
        // current_saved_lots.push(newLot)
        // // console.log(current_saved_lots);
        // current_saved_lots.length>15?current_saved_lots.shift():null
        // // console.log(current_saved_lots);
        // localStorage.setItem('current_saved_lots', JSON.stringify(current_saved_lots));
        // tab_port.postMessage({intercepted:newLot})


    }
})


const removeDuplicateUrls=(arr)=>{
    const uniqueUrls = {};

    arr.forEach(obj => {
        if(obj && obj.url){
            if (uniqueUrls.hasOwnProperty(obj.url)) {
                if (obj.timestamp > uniqueUrls[obj.url].timestamp) {
                    uniqueUrls[obj.url] = obj;
                }
            } else {
                
                uniqueUrls[obj.url] = obj;
            }
        }
        
    });
   
    const filteredArray = Object.values(uniqueUrls);

    return filteredArray;

}




chrome.runtime.onConnect.addListener((port)=>{
    
    port.onMessage.addListener(async(msg,port)=>{
        console.log(msg);
    })
})


const modifyAccountInfo=async()=>{
    let signOutSpan=await loadSelector('span:contains("Account Settings")')
    let parentElement=signOutSpan.parentNode

    let sibling  = parentElement.firstChild;
    while (sibling) {
        let text=sibling.textContent.toLowerCase()
        if(!(text.includes('member')) && sibling.style){
            sibling.style.display='none'
        }
        sibling = sibling.nextSibling;
    }
}

const modifyPaymentDrop=async()=>{
    let paymentLis=$('li > a[href*="member-payments"]')
   
    let paymentOptLi=$('li > a[href*="Payment"]')
   
    if(paymentOptLi[0]){
        paymentOptLi.each(function(index, element) {
            let parent=$(element).parent()
            let text=parent[0].innerText.trim()
            if(text=='Payment Options'){
                parent[0].style.display='none'
            }
        }); 
    }
    if(paymentLis[0]){
        paymentLis.each(function(index, element) {
            let parent=$(element).parent()
            let text=parent[0].innerText.trim()
            
            if(text=='Deposits' || text=='Funds' || text=='Payment Options'){
                parent[0].style.display='none'
            }
        });
    }
}

var observer = new MutationObserver((mutations)=> {
    mutations.forEach(mutation=>{
        if(mutation.addedNodes.length!==0 && mutation.type === "childList"){
            mutation.addedNodes.forEach(item=>{
                modifyPaymentDrop()
                
                if(item.nodeName=='UL'){
                   
                }
            
            })
        }
    })
  });



const modifyLotsWonTable=async()=>{
    let deliveryColumn=await loadSelector('th')
    console.log(deliveryColumn);
    // deliveryColumn.style.display='none'
}
if(window.location.href.includes('/lotsWon/')){
    // modifyLotsWonTable()
}

const allViews=()=>{
    modifyAccountInfo()
    observer.observe(document, { childList: true, subtree: true });
}
chrome.storage.local.get(['copart_member_number'],res=>{
    if(res.copart_member_number){
        allViews()
    }
})

