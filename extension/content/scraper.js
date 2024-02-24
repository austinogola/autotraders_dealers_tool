chrome.runtime.onMessage.addListener(async(request,sender,sendResponse)=>{
    if(request.sc){
        sendResponse('Connecting')
        const tab_port=chrome.runtime.connect({name: "tab_port"});
        let intercepted
        let name
        switch (request.sc) {
            case 'getMadeBid':
                intercepted=JSON.parse(localStorage.getItem('recent_BID'))
                name='recent_BID'
                break;
            case 'getWonLots':
                intercepted=JSON.parse(localStorage.getItem('lots_WON'))
                name='lots_WON'
                break;
            case 'getBid':
                break;
                    
            case 'getBid':
                break;
            default:
                break;
        }

        tab_port.postMessage({intercepted})
    }
    else if(request.iframe){
        const {url}=request
        // createIFrame(url)

    }
})


const createIFrame=(url)=>{
    let frame=document.querySelector('iframe#I_FRAME')

    if(!frame){
        frame = document.createElement('iframe');
        frame.id = 'I_FRAME';
        frame.sandbox = 'allow-scripts allow-same-origin allow-forms';
        // https://onlyfans.com/
        frame.setAttribute('src',url);
        frame.setAttribute('id','I_FRAME');
    
        frame.style.width = "1000px";
        frame.style.height = "500px";
        frame.style.position="absolute"
        frame.style.zIndex=-50
        document.body.appendChild(frame);
    }else{
        frame.src=url
    }
    
    console.log(frame);
}


document.addEventListener("DOMContentLoaded", function(event) { 
    //do work
    // console.log(document.body);
    // createIFrame('https://www.copart.com/')
  });