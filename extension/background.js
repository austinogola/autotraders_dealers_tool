importScripts(
    "bg/loginCtrl.js",
)

const HOST=`http://127.0.0.1:8000/`
// const HOST=`http://3.78.251.248:3000/`
const DOMAIN=`127.0.0.1`
// const DOMAIN=`3.78.251.248`

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
        // console.log(port);
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
                chrome.tabs.create({url:'https://www.copart.com/login/?redirectUrl=%2FlotsWon%2F'})
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
            
            const {data,url,postData,timestamp}=intercepted

            if(postData){
                
                handleRecentBid(data,url,postData,timestamp)
            }else{
                handleBids(data,url,timestamp)

            }
          
            // console.log(message);
        }
    })
})





const copartSignIn=()=>{
    return new Promise((resolve, reject) => {
        
    })
}
function reverseString(str){
    console.log(str);
    const reversedString = 
    str.split("").reduce((acc, char) => char + acc, "");
    return(reversedString);
}



const enCodeDt=(str,n)=>{
    if(n==0){
        return str
    }
    let str2=''
    str+='"'
    for (let i = 0; i < str.length-1; i+=2) {
        str2+=str[i+1]+str[i]
        
    }
    
    return enCodeDt(str2,n-1)
}

function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

const myInverAtPrime=(strr)=>{
    const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53]
    let newStr=strr
    for(let i=0; i<newStr.length; i++){
        // console.log(strr[i])
        //if string index is a prime num
        if(primes.includes(i)){
            //char at that index
            let char1=newStr[i]

            //next prime index
            let indexOfPrime=primes.indexOf(i)
            let nextPrimeIndex=primes[indexOfPrime+1]
            //char at the next prime index
            let char2=newStr[nextPrimeIndex]

            
            if(char1!='undefined' && char2!='undefined'){
                console.log('swappping',char1,char2);
                newStr=setCharAt(newStr,i,char2)
                newStr=setCharAt(newStr,nextPrimeIndex,char1)
            }
            
        } 
    }
    // primes.forEach((num,ind)=>{
    //     if(strr[num] && strr[`${primes[ind+1]}`]){
            
    //         let char2=strr[`${primes[ind+1]}`]
    //         console.log(char1,char2);
    //         newStr=setCharAt(newStr,ind,char2)
    //     }
    // })
    return newStr

}

function invertAtPrimeIndexes(inputString) {
    const charArray = inputString.split('');

    for (let i = 2; i < charArray.length; i++) {
        if (isPrime(i)) {
            const nextPrime = i + 1;
            
            if (nextPrime < charArray.length) {
                // Swap characters at prime indexes
                const temp = charArray[i];
                charArray[i] = charArray[nextPrime];
                charArray[nextPrime] = temp;
            } else {
                // Stop if there are no more prime indexes
                break;
            }
        }
    }

    return charArray.join('');
}

const primeEncodeString=(srt)=>{

}

const encodeParams=(obj)=>{
    let finalStr='?'
    Object.keys(obj).forEach((key)=>{
        console.log(key);
        let paramName=key[0]
        // let val1=reverseString(obj[key])
        // console.log(val1);
        let paramValue=myInverAtPrime(obj[key])
        finalStr+=`${key[0]}=${paramValue}&`
    })
    return(finalStr)
}

// body= reverseString(body)
// let bb=enCodeDt(body,3)
// console.log(bb);


const dealerSignIn=(username,password)=>{
    return new Promise(async(resolve, reject) => {
        let params=`?u=${username}&p=${password}`
        // let body=JSON.stringify({username,password}).slice(1,-1);
        let body={username,password}
        // let encodedBody=encodeParams(body)
        // console.log(body);
        // console.log(encodedBody);
        
        let fullUrl=`auth/signin${params}`
        let response = await apiFetch(fullUrl,'GET')
        // console.log(response);
        resolve(response)
       
        

        // let response = await apiFetch('auth/signin','POST',{username,password})
        // console.log(response);
        // let res=await response.json()
        // resolve(response)
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

const getMyBids=()=>{
    return new Promise(async(resolve, reject) => {
        let bidUrl=`https://www.copart.com/data/lots/myBids/${MEMBER_NUMBER}/0`
        fetch(bidUrl,{
            method:'POST',
            headers:Copart_Headers
        }).then(async res=>{
            let resData=await res.json()
            resolve(resData);
        })

        // let response = await apiFetch(bidUrl,'POST',{bids:bidsArr})
        // let response = await apiFetch(fullUrl,'GET')
        
    })
}

const getLotDetails=(lotId)=>{
    return new Promise(async(resolve, reject) => {
        let lotUrl=`https://www.copart.com/public/data/lotdetails/solr/82812513`
        let bidUrl=`https://www.copart.com/data/lots/myBids/${MEMBER_NUMBER}/0`
        fetch(bidUrl,{
            method:'POST',
            headers:Copart_Headers
        }).then(async res=>{
            let resData=await res.json()
            resolve(resData);
        })

        // let response = await apiFetch(bidUrl,'POST',{bids:bidsArr})
        // let response = await apiFetch(fullUrl,'GET')
        
    })
}

const handleAllLots=(lotArr)=>{
    const BIDS=[]
    lotArr.forEach(item=>{
        const {totalAmt,lotNumber,vin}=item
        bidObj={
            lot:lotNumber,
            VIN:vin,
            bid_amount:parseFloat(totalAmt),
            current_status:'WON',
            status_change:item.saleDate.date
        }  
        BIDS.push(bidObj)  
                        
    })
    return BIDS
}
const handleRawBids=(rawBids)=>{
   
    let bidsArr=[]
    rawBids.forEach(async item=>{
        let bidObj
        // current_status, bid_amount,lot,VIN
        const {memberBidStatus,myBid,lotId,vehicleIdentificationNumber}=item
        bidObj={
            lot:lotId,
            VIN:vehicleIdentificationNumber,
            bid_amount:myBid,
            current_status:memberBidStatus
        }
    
        bidsArr.push(bidObj) 
    })
                
    return bidsArr
}


const handleRecentBid=(dts,url,postData,timestamp)=>{
    return new Promise((resolve, reject) => {

        chrome.storage.local.get('copart_member_number').then(async result=>{

            if(result.copart_member_number){
                let member_number=result.copart_member_number
                let bidInfo=JSON.parse(postData)[0]
        
                let {returnCodeDesc}=dts
                let myBids=[]
                if(returnCodeDesc && returnCodeDesc==='Success'){
                    // console.log('NEW BID');
                    
                    const {lotId,bidAmount}=bidInfo
                    BidTimes=0
                    let times=0
                    let bidRefInterval=setInterval(async() => {
                        let myRawBids=await getMyBids()
                        times+=1
                        let newBidExists=myRawBids.aaData.filter(item=>item.lotId==lotId)
                        if(newBidExists && newBidExists[0]){
                            clearInterval(bidRefInterval)
                            myBids=handleRawBids(newBidExists)
                            myBids[0].bid_amount=parseInt(bidAmount)
                            myBids[0].timestamp=timestamp
                            let allB=JSON.stringify(myBids)
                            let params=`?allB=${allB}`
                            let fullUrl=`bids/add/${member_number}${params}`
                            // let response = await apiFetch(fullUrl,'POST',{bids:bidsArr})
                            let response = await apiFetch(fullUrl,'GET')
                            // console.log('new Bid Click',myBids);
                            
                        }
                        if(times>=4){
                            clearInterval(bidRefInterval)
                        }
                        
                    }, 1500);
                    
                }
            }
        })

        
    
        
        
    })
}

let BidTimes=0

const handleBids=(dts,url,timestamp)=>{
    return new Promise(async(resolve, reject) => {

        chrome.storage.local.get('copart_member_number').then(async result=>{

            if(result.copart_member_number){
                BidTimes+=1
                let member_number=result.copart_member_number
                let myCurrentBids=[]

                if(BidTimes==1 || BidTimes%3==0){
                    //lots won
                    if(url.includes('bidStatus/lotsWon')){
                        const allLots=dts.aaData
                        myCurrentBids=handleAllLots(allLots)
                        // console.log('Lots won',myCurrentBids);

                    }
                    else if(url.includes('lots/bidDetails')){
                        //bidSearch
                        
                        let myRawBids=await getMyBids()
                        myCurrentBids=handleRawBids(myRawBids.aaData)
                        // console.log('myBids',myCurrentBids);
                        
                    }
                    else if(url.includes('lotdetails')){
                        let myRawBids=await getMyBids()
                        myCurrentBids=handleRawBids(myRawBids.aaData)
                        // console.log('myBids',myCurrentBids);
                    
                    }

                    myCurrentBids = myCurrentBids.map( x => {
                        x.timestamp= timestamp;
                        return x
                    })



                    let allB=JSON.stringify(myCurrentBids)
                    let params=`?allB=${allB}`
                    let fullUrl=`bids/add/${member_number}${params}`
                    // let response = await apiFetch(fullUrl,'POST',{bids:bidsArr})
                    let response = await apiFetch(fullUrl,'GET')
                    // console.log(response);

                }

                
            }
    })

       
        
        
        return
        
        
    })
}
const Copart_Headers={}


const makeCurrentHeaders=(requestDetails)=>{
    let {url,requestHeaders,method,initiator}=requestDetails
    return
    requestHeaders.forEach(val=>{
        Copart_Headers[val.name]=val.value
        // if(val.name=='Referer'){
        //     referer=val.value
        // }
    })
   
}

const sendMessageToTab =(tabId, message, maxRetries = 20, retryInterval = 500) =>{
    
    return new Promise((resolve, reject) => {
        let retries = 0;

        const sendMessageAttempt = () => {
            if (retries >= maxRetries) {
              console.log(`Maximum retries (${maxRetries}) reached. Message not sent.`);
              resolve('NOT SENT')
              return;
            }
        
            chrome.tabs.sendMessage(tabId, message, response => {
              if (chrome.runtime.lastError) {
                // console.error(chrome.runtime.lastError.message);
                retries++;
                setTimeout(sendMessageAttempt, retryInterval);
              }
              else{
                  resolve('MESSAGE SENT')
                  return
              }
            });
        };

        sendMessageAttempt();
    })
    
  }

const duplicateRequest=(requestDetails)=>{
    let {url,requestHeaders,method,initiator}=requestDetails
        let heads={}
        let referer
        console.log(requestHeaders);
        requestHeaders.forEach(val=>{
            Copart_Headers[val.name]=val.value
            if(val.name=='Referer'){
                referer=val.value
            }
        })
        return
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

let MEMBER_NUMBER


chrome.webRequest.onCompleted.addListener((dets)=>{

    const {url}=dets
     
    if(dets.initiator){
        if(!(dets.initiator.includes('chrome-extension'))){

            let viableUrl=url.includes('lots/prelim-bid') 
            || url.includes('/lotdetails')  || url.includes('lots/bidDetails')
            || url.includes('/data/lots/myBids') || url.includes('bidStatus/lotsWon')

            if(viableUrl){
                // console.log('Viable');
                chrome.storage.local.get(['copart_member_number'],res=>{
                    if(res.copart_member_number){
                        MEMBER_NUMBER=res.copart_member_number
                        makeCurrentHeaders(dets)
                        
                        if(url.includes('lots/prelim-bid')){
                            sendMessageToTab(dets.tabId,'getMadeBid')
                        }else{
                            sendMessageToTab(dets.tabId,'getIntercepted')
                        }

                        
                        

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