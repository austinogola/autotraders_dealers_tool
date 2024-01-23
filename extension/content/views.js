

const modifyAccountInfo=async()=>{
    let signOutSpan=await loadSelector('span:contains("Account Settings")')
    // console.log(signOutSpan);
    let parentElement=signOutSpan.parentNode

    let sibling  = parentElement.firstChild;
    while (sibling) {
        let text=sibling.textContent.toLowerCase()
        if(!(text.includes('member')) && sibling.style){
            sibling.style.display='none'
            // console.log();
        }
        sibling = sibling.nextSibling;
    }
   
    console.log(parentElement);
    // console.log(signOutSpan);
}

modifyAccountInfo()

const modifyPaymentDrop=async()=>{
    let paymentDueLi=(await loadSelector('li > a[href="./member-payments"]')).parentNode
    let parentUl=paymentDueLi.parentNode

    let sibling  = parentUl.firstChild;
    let toRemove=[]

    while (sibling) {
        let text=sibling.textContent.trim().toLowerCase()
        // console.log(text);
        if(text.includes('deposits') || text.includes('funds')  || text.includes('options')){
            sibling.style.display='none'
            toRemove.push(sibling)
            // console.log(sibling);
        }
        sibling = sibling.nextSibling;
    }

    toRemove.forEach(element => {
        element.parentNode.removeChild(element);
    });
    console.log(parentUl);
}

modifyPaymentDrop()