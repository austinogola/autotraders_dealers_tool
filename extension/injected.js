(async function(xhr,win,chro) {
    

    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;


    let WIND=window

    var originalFetch = window.fetch

    WIND.fetch=async function(callback){
        const originalthing=this
        

        if(callback.includes('data/lots/myBids') || callback.includes('data/bidStatus/lotsWon')){
            console.log('US TOO',callback);
            let final = await originalFetch.call(originalthing, callback);
            const parsedResponse=await final.json()
            console.log(parsedResponse);
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
        return open.apply(this, arguments);
    };

    XHR.send = function(postData) {
        // console.log(this);
        
        this.addEventListener('load', async function() {
            
            const {responseURL,responseText}=this
            

            if(responseURL.includes('data/lots/myBids') || responseURL.includes('data/bidStatus/lotsWon')){
                console.log('WE ARE UP',responseURL);
                let parsedResponse=JSON.parse(responseText)
                let obj={url:responseURL,data:parsedResponse}
                localStorage.setItem('intercepted_EXT', JSON.stringify(obj));
                console.log(parsedResponse);
               
            }
            
           
        });
        return send.apply(this, arguments);
    }
  
    return
  

})(XMLHttpRequest,window,chrome)