var s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('injected.js');
s.async = true;
s.referrerpolicy='same-origin'

localStorage.setItem('intercepted_EXT', JSON.stringify({}));

chrome.storage.local.get(['MAX_BID'],res=>{
    if(res.MAX_BID){
        const {MAX_BID}=res
        // console.log(MAX_BID);
        localStorage.setItem('MAX_BID',MAX_BID)
        s.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
        
    }

    
    
})




