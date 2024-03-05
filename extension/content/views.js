
chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    
    if(request=='getIntercepted'){
        sendResponse('Connecting')
        
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
        
        if(Object.keys(intercepted).length<1){
            setTimeout(() => {
                let intercepted=JSON.parse(localStorage.getItem('recent_BID'))
                tab_port.postMessage({intercepted})
                
            }, 5000);
        }else{
            
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

let USERNAME




chrome.runtime.onConnect.addListener((port)=>{
    
    port.onMessage.addListener(async(msg,port)=>{
        console.log(msg);
    })
})


const modifyAccountInfo=async()=>{

    chrome.storage.local.get(["bidderProfile"],async res=>{
        if(res.bidderProfile){
            USERNAME=res.bidderProfile.username

            let usernameSpan=await loadSelector('span.loggedInUserIcon')
            usernameSpan.innerText=USERNAME
        }
    })

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

    // .
    
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




const paymentHistoryViews=()=>{
    removeTransaction()
    modifyTable('Title Status')
}

const removeTransaction=async()=>{
    const transView=await loadSelector('label:contains("Transaction View")')
   
    $('label:contains("Transaction View")').empty()
    transView.style.display='none'
}

const paymentDueViews=()=>{
    removeSummary()
    modifyTable('Title Status')
}

const addToTable=async(newTitle)=>{
    let table=await loadSelector('table')

    let headRow=await loadSelector('thead tr')
   

    let newTh=document.createElement('th')
    newTh.innerHTML=' Winner '
    headRow.appendChild(newTh)

    var tableRows=await loadSelector('tbody tr',true);
    
    tableRows.each(function(index) {
        let element=$(this)[0]
        let newTd=document.createElement('th')
        newTd.innerHTML='-'
        element.appendChild(newTd)
        
    });


    // $('thead tr')[0].append('<th>Winner</th>');
    

   
    
}
const modifyTable=async(titleString)=>{
    let table=await loadSelector('table')
    
    let statIndex
    var headerRows = await loadSelector('th',true);
    headerRows.each(function(index) {
        let text=$(this).text().trim()
       
        if(text==titleString){
            // console.log($(this)); 
            statIndex=index
            $(this).text(' Winner ')
            // $(this).css('display', 'none');
        }else{
            if(statIndex){
                $(this).css('display', 'none');
            }
        }
        
        
    });

    var tableRows=await loadSelector('tbody tr',true);

    tableRows.each(function(index) {
        $(this).find('td').each(function(spanIndex) {
            if(spanIndex==statIndex){
                console.log($(this));
                $(this).text(`${USERNAME}`);
                $(this).css('white-space', 'initial');

            }else if(spanIndex-1==statIndex){
                $(this).css('display', 'none');
            }
            
        });
        
    });
    return
    var headers = headerRow.getElementsByTagName('th');
    console.log(headers);

    let columnIndex

    for (var i = 0; i < headers.length; i++) {
        if (headers[i].innerHTML === "Title Status") {
           columnIndex = i;
           console.log(headers[i]);
           break;
           }
       }

}
const removeSummary=async()=>{
    let summary_div=await loadSelector('div.payment-summary')
    summary_div.style.display='none'
}

const preventMaxBids=async()=>{
    chrome.storage.local.get(['MAX_BID'],async res=>{
        if(res.MAX_BID){
            let bidInput=await loadSelector('input[name="maxBid"]')
            console.log(bidInput);
            bidInput.addEventListener('input',e=>{
                const val=parseFloat(e.target.value)
                if(val>res.MAX_BID){
                    e.target.value=res.MAX_BID
                }
            })
        }
    })
    
}

const allViews=()=>{
    modifyAccountInfo()
    observer.observe(document, { childList: true, subtree: true });
    let location=window.location.href
    if(location.includes('copart.com/lotsWon/')){
        modifyTable("Delivery")
    }
    if(location.includes('copart.com/lotsLost/')){
        addToTable("Winner")
    }
    if(location.includes('member-payments/unpaid-invoices')){
        paymentDueViews()
    }
    if(location.includes('member-payments/payment-history')){
        paymentHistoryViews()
    }
    if(location.includes('https://www.copart.com/lot/')){
        preventMaxBids()
    }
}

chrome.storage.local.get(['MEMBER_NUMBER'],res=>{
    if(res.MEMBER_NUMBER){
        allViews()
    }
})

