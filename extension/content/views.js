

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

modifyAccountInfo()

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
observer.observe(document, { childList: true, subtree: true });


const modifyLotsWonTable=async()=>{
    let deliveryColumn=await loadSelector('th')
    console.log(deliveryColumn);
    // deliveryColumn.style.display='none'
}
if(window.location.href.includes('/lotsWon/')){
    // modifyLotsWonTable()
}
