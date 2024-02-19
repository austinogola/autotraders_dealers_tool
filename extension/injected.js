(async function(xhr,win,chro) {
    

    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;


    let WIND=window

    var originalFetch = window.fetch

    WIND.fetch=async function(callback){
        const originalthing=this

        let relUrl=callback.includes('lots/prelim-bid') 
            || callback.includes('/lotdetails')  || callback.includes('lots/bidDetails')
            || callback.includes('/data/lots/myBids') || callback.includes('bidStatus/lotsWon')
        

        if(relUrl){
            if(callback.includes('lots/prelim-bid') ){
                
            }
            let final = await originalFetch.call(originalthing, callback);
            const parsedResponse=await final.json()
            // console.log(parsedResponse);
            return final
        }
        
        try {
            return originalFetch.call(originalthing, callback);
            
        } catch (error) {
            console.log(error);
        }

        


    }
    
    XHR.open = function(method, url) {
        // console.log(this);
        if(url.includes('lots/prelim-bid')){
           
        }
        return open.apply(this, arguments);
    };

    XHR.send = function(postData) {
        // console.log(this);
        
        this.addEventListener('load', async function() {
            
            const {responseURL,responseText}=this


            // const relUrl=responseURL.includes('data/lots/myBids') || responseURL.includes('data/bidStatus/lotsWon')
           
            let relUrl=responseURL.includes('lots/prelim-bid') || responseURL.includes('lots/live-bid') 
            || (responseURL.includes('/lotdetails') && !responseURL.includes('/lotImages') )
            //  || responseURL.includes('lots/bidDetails')
            // || responseURL.includes('/data/lots/myBids') || responseURL.includes('bidStatus/lotsWon')
            

            if(relUrl){
                let parsedResponse
                let obj
                try {
                    parsedResponse=JSON.parse(responseText)
                    obj={url:responseURL,data:parsedResponse,timestamp:new Date().getTime()}
                    
                } catch (error) {
                    console.log('error');
                    
                }
                
                if(responseURL.includes('lots/prelim-bid') || responseURL.includes('lots/live-bid') ){
                    obj.postData=postData
                    localStorage.setItem('recent_BID', JSON.stringify(obj));
                }else if(responseURL.includes('/lotdetails') && !responseURL.includes('/lotImages') ){
                   
                    localStorage.setItem('all_saved_lots', JSON.stringify([]));
                }else{
                    localStorage.setItem('intercepted_EXT', JSON.stringify([]));
                }
                

               
            }
            
           
        });
        return send.apply(this, arguments);
    }
  
    return
  

})(XMLHttpRequest,window,chrome)