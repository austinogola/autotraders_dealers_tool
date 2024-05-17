(async function(xhr,win,st) {
    

    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;


    let WIND=window

    var originalFetch = window.fetch

    const MY_MAX_BID=st.getItem('MAX_BID')

    WIND.fetch=async function(callback){
        
        const originalthing=this

      
        let relUrl=callback.includes('lots/prelim-bid') || callback.includes('lots/live-bid')
        if(relUrl){
            console.log(callback,arguments,this);
            // return originalFetch.apply(this, arguments);
        }

        if(false){
            if(callback.includes('lots/prelim-bid') ){
                
            }
            let final = await originalFetch.apply(this, arguments);
            const parsedResponse=await final.json()
            // console.log(parsedResponse);
            return final
        }
        
        try {
            return originalFetch.apply(this, arguments);
            
        } catch (error) {
            console.log(error);
        }

        


    }
    
    XHR.open = function(method, url) {

        let relUrl=url.includes('lots/prelim-bid') || url.includes('lots/live-bid')
        return open.apply(this, arguments);
    };

    XHR.send = function(postData) {
        console.log('postData',postData);
        this.addEventListener('load', async function() {
            
            const {responseURL,responseText}=this
            let url=responseURL
            let relUrl=url.includes('lots/prelim-bid')
            if(url.includes('lots/prelim-bid')){
                let parsedResponse=JSON.parse(responseText)
                let obj={url:responseURL,data:parsedResponse,timestamp:new Date().getTime(),postData}
                localStorage.setItem('recent_BID', JSON.stringify(obj));
                
            }
            else if(url.includes('g2auction.copart.com/g2/authenticate/api/v1/sale/messages')){
                let parsedResponse=JSON.parse(responseText)
                let obj={url:responseURL,data:parsedResponse,timestamp:new Date().getTime()}
                localStorage.setItem('recent_BID', JSON.stringify(obj));
            }
            
            
            
           
        });
        return send.apply(this, arguments);
    }
  
    return
  

})(XMLHttpRequest,window,localStorage)