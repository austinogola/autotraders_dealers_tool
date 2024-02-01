importScripts(
    "bg/loginCtrl.js",
)

// const HOST=`http://127.0.0.1:8000/`
const HOST=`http://3.78.251.248:3000/`
// const DOMAIN=`127.0.0.1`
const DOMAIN=`3.78.251.248`

const  clearCopart=()=>{

    chrome.browsingData.remove({
        "origins": ["https://www.copart.com"]
    }, {
        "cacheStorage": true,
        "cookies": true,
        "fileSystems": true,
        "indexedDB": true,
        "localStorage": true,
        "serviceWorkers": true,
        "webSQL": true
    }, console.log);

}

const getCsrfToken=()=>{
    return new Promise(async(resolve, reject) => {
        chrome.cookies.getAll({name:'csrftoken',domain:DOMAIN},ck=>{
            resolve (ck[0].value)
        })
    })
}



const getCopartCookies=()=>{
    return new Promise(async(resolve, reject) => {
        chrome.cookies.getAll({name:'csrftoken',domain:'www.copart.com'},cks=>{
            let cookieString=''
            cks.forEach(cookie => {
                // headers[cookie.name]=cookie.value
                cookieString+=`${cookie.name}=${cookie.value};`
            });
            resolve(cookieString)
        })
    })
}

const apiFetch=(path,method,body)=>{
    return new Promise(async(resolve, reject) => {
        let csrfToken=await getCsrfToken()
        setTimeout(() => {
            resolve({error:true,message:'Slow network connection'})
        }, 10000);
        fetch(HOST+path,{
            method:method,
            headers:{
                'Content-Type':'application/json',
                'X-CSRFToken': csrfToken
            },
            body:body?JSON.stringify(body):null
        }).then(async response=>{
            let res=await response.json()
            resolve(res)
            
        })
        .catch(err=>{
            resolve({error:true,message:err.message})
        })
    })
}

chrome.runtime.onInstalled.addListener(async(dets)=>{
    // clearCopart()
    // chrome.storage.local.clear()
  })



chrome.runtime.onMessage.addListener(async(request, sender, sendResponse)=>{
    
})
let tab_port
let popup_port
chrome.runtime.onConnect.addListener((port)=>{
    if(port.name=='tab_port'){
        tab_port=port
        console.log(port);
    }
    port.onMessage.addListener(async(message,port)=>{
        
        if(message.dealerSign){
            let {username,password}=message
            let copartCreds=await dealerSignIn(username,password)
            // console.log(copartCreds);
            port.postMessage({dealerStatus:copartCreds})
            // console.log(copartCreds);
            if(copartCreds.success){
                let {profile}=copartCreds
                chrome.storage.local.set({ copartProfile: profile })
            }
        }
        if(message.signInTo){
            clearCopart()
            const selected_copart_account=message.signInTo
            chrome.storage.local.set({ selected_copart_account }).then(() => {
                // console.log("copart account chosen: ",selected_copart_account);
                chrome.tabs.create({url:'https://www.copart.com/login/'})
              });
        }
        if(message.signOut){
            clearCopart()
            // chrome.storage.local.set({ copartProfile: {} })
            chrome.storage.local.clear()
            // chrome.storage.local.set({ selected_copart_account })
            // console.log(message);
        }
        if(message.intercepted){
            let intercepted=message.intercepted
            const {data,url}=intercepted
            console.log(data,url);
            handleBids(data,url.includes('lotsWon'))
            // console.log(message);
        }
    })
})





const copartSignIn=()=>{
    return new Promise((resolve, reject) => {
        
    })
}


const dealerSignIn=(username,password)=>{
    return new Promise(async(resolve, reject) => {
        let params=`u=${username}&p=${password}`
        let response = await apiFetch('auth/signin','POST',{username,password})
        // console.log(response);
        // let res=await response.json()
        resolve(response)
    })
}

// dealerSignIn('austin','austin254')
//JSESSIONID
// chrome.cookies.onChanged.addListener((changeInfo)=>{
//     let ck=changeInfo.cookie
//     let copartCks=ck.domain.includes('copart') && (ck.name=='G2JSESSIONID' || ck.name=='JSESSIONID')
//     if(copartCks){
//         // console.log(changeInfo);
//     }
// })

let reqHeaders={}

const makeCurrentHeaders=(headersArr)=>{
    headersArr.forEach(item=>{
        reqHeaders[item.name]=item.value
    })
}

let exampleBids=[
    {
        bidStatusStr:'Winning',
        currentBid:3750,
        lotNumber:76582881,
        lotId:'76582881',
        vehicleIdentificationNumber:'HNDJN56342A21G7402953',
        
    },
    {
        bidStatusStr:'Won',
        currentBid:2150,
        lotNumber:76382083,
        lotId:'76382083',
        vehicleIdentificationNumber:'KNDJN2A2A21G7402953',
        
    },
    {
        bidStatusStr:'Outbid',
        currentBid:4110,
        lotNumber:67382063,
        lotId:'67382063',
        vehicleIdentificationNumber:'MDDJN2A232157402Z53',
        
    },
    {
        bidStatusStr:'Winning',
        currentBid:3750,
        lotNumber:193820846,
        lotId:'193820846',
        vehicleIdentificationNumber:'BKDJN2A2A2147202916',
        
    },
    // {
    //     bidStatusStr:'Winning',
    //     currentBid:3850,
    //     lotNumber:98174081,
    //     lotId:'98174081',
    //     vehicleIdentificationNumber:'LPMJN2A2A21G2402939',
        
    // }
]

let exampleBid1


const handleBids=(dts,won)=>{
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('copart_member_number').then(async result=>{
            if(result.copart_member_number){
                let member_number=result.copart_member_number
                let bids=dts.aaData
                
                let bidsArr=[]

                // exampleBids
                bids.forEach(async item=>{
                    let bidObj
                    if(won){
                        const {totalAmt,lotNumber,vin}=item 
                        bidObj={
                            lot:lotNumber,
                            VIN:vin,
                            bid_amount:parseFloat(totalAmt),
                            current_status:'WON'
                        } 
                    }else{
                        const {memberBidStatus,myBid,lotId,vehicleIdentificationNumber}=item
                        bidObj={
                            lot:lotId,
                            VIN:vehicleIdentificationNumber,
                            bid_amount:myBid,
                            current_status:memberBidStatus
                        }
                    }
                    bidsArr.push(bidObj) 
                //I need -->timestamp, /lot, VIN, /bid_amount, /current_status,username,bidder
                
                })
                console.log(bidsArr);
                let response = await apiFetch(`bids/add/${member_number}`,'POST',{bids:bidsArr})
                console.log(response);
            }
    })
        
    })
}
const duplicateRequest=(requestDetails)=>{
    let {url,requestHeaders,method,initiator}=requestDetails
        let heads={}
        let referer
        requestHeaders.forEach(val=>{
            heads[val.name]=val.value
            if(val.name=='Referer'){
                referer=val.value
            }
        })
        heads['Origin']=initiator
        heads['Referer']=referer
        fetch(url,{method:method,headers:heads})
        .then(async res=>{
            if(res.status==200){
                let resBody=await res.json()
                // console.log(url,resBody);
                // console.log(url);
                
                if(url.includes('/data/lots/') || url.includes('/lotsWon')){
                    console.log(resBody,url);
                    // console.log(url,resBody,requestDetails);
                    return
                    if(resBody.aaData){
                        let bidsArr=[...resBody.aaData]
                        handleBids(bidsArr)
                    }
                    
                }else if(url.includes('/data/userConfig/')){

                }
                

            }else{
                console.log(`Error duplicating ${url} `);
            }

        })
        .catch(err=>{
                console.log('error',`(${url})`,err.message);
        })

   
}


chrome.webRequest.onCompleted.addListener((dets)=>{

    const {url}=dets
     
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){

            // let viableUrl=url.includes('/data/lots/') || url.includes('bidStatus/lotsWon') ||
            // url.includes('public/data/contactinfo') || url.includes('data/member/account/alerts') ||
            // url.includes('public/data/userConfig')
            let viableUrl=url.includes('/data/lots/myBids') || url.includes('bidStatus/lotsWon')

            if(viableUrl){
                chrome.storage.local.get(['copart_member_number'],res=>{
                    if(res.copart_member_number){
                        console.log(url);
                        // duplicateRequest(dets)
                        tab_port.postMessage('Hi')

                    }
                })
                
            }
        }
        
    }
    
    
},{urls:["https://*.copart.com/*","https://copart.com/*"]},["responseHeaders","extraHeaders"])

let times

// ["requestHeaders","extraHeaders"]

// https://www.copart.com/data/lots/watchList

// https://www.copart.com/data/bidder-numbers

// https://www.copart.com/data/lots/myBids/286042/0