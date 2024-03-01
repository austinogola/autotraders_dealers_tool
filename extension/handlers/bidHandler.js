const getMyBids=(MEMBER_NUMBER)=>{
    return new Promise(async(resolve, reject) => {
        let bidUrl=`https://www.copart.com/data/lots/myBids/${MEMBER_NUMBER}/0`
        fetch(bidUrl,{
            method:'POST',
            headers:Copart_Headers
        }).then(async res=>{
            let resData=await res.json()
            resolve(resData.aaData);
        })

        
    })
}
const checkCurrentBids=(timestamp)=>{
    chrome.storage.local.get(['userCurrentBids','member_number'],async res=>{
        // console.log(res);
        
        if(res.userCurrentBids && res.member_number){
            let myBids=await getMyBids(res.member_number)

            res.currentBids.forEach(lotId=>{
               let theBid=myBids.filter(item=>item.lotId==lotId)

               if(theBid && theBid[0]){
                    const {memberBidStatus,myBid,vehicleIdentificationNumber}=theBid
                    const bidInf={current_status:memberBidStatus,
                        bid_amount:myBid,VIN:vehicleIdentificationNumber,lot:lotId,
                        timestamp
                    }
                    updateBid(bidInf)
                    
                }
                // else{
                //     const bidInf={lot:lotId,current_status:'OUTBID',timestamp}
                // }
            })

            

            
        }
    })
}


const updateBid=(bidInfo)=>{
    
    return new Promise(async(resolve, reject) => {

        chrome.storage.local.get(['member_number'],async res=>{
            // console.log(res);
            if(res.member_number){
                member_number=res.member_number
                let theBid=JSON.stringify(bidInfo)
                let params=`?theBid=${theBid}`
                let fullUrl=`bids/update/${member_number}${params}`
                let response = await apiFetch(fullUrl,'GET')
                // if(response.currentBids){
                //     chrome.storage.local.set({userCurrentBids:response.currentBids})

                // }
                
            }
        })
        
        
        
    })
}

const sendBidToServer=(bidInfo)=>{
    console.log(bidInfo);
    
    return new Promise(async(resolve, reject) => {

        chrome.storage.local.get(['member_number'],async res=>{
            // console.log(res);
            if(res.member_number){
                console.log(res);
                member_number=res.member_number
                let theBid=JSON.stringify(bidInfo)
                let params=`?theBid=${theBid}`
                let fullUrl=`bids/add/${member_number}${params}`
                let response = await apiFetch(fullUrl,'GET')
                if(response.currentBids){
                    chrome.storage.local.set({userCurrentBids:response.currentBids})

                }
                
            }
        })
        
        
        
    })
}

const handleNewBid=(bidData)=>{
    const {data,postData,timestamp}=bidData

    //Check if successfull
    let lotResult=data.data.result.lots
    if(Object.keys(lotResult).length==0){
        console.log("successfull",postData);
        let bidInfos=JSON.parse(postData)
        bidInfos.forEach(async lotObj=>{
            const {lotId,bidAmount}=lotObj
            let rawLotInfo=await getLotDetails(parseInt(lotId))
            let bidObj={
                current_status:'WINNING',
                bid_amount:bidAmount,
                VIN:rawLotInfo.fv,
                lot:lotId
            }
            console.log(bidObj);
            sendBidToServer(bidObj)
        })
    }
}

const handleNewBid2=(bidData)=>{
    const {data,url,postData,timestamp}=bidData

    return new Promise(async(resolve, reject) => {
        chrome.storage.local.get('copart_member_number').then(async result=>{
            if(result.copart_member_number){
                let member_number=result.copart_member_number
                let bidInfos=JSON.parse(postData)
                console.log(bidInfos);

                bidInfos.forEach(async bidInfo=>{
                    let {returnCodeDesc}=data
                    if(returnCodeDesc && returnCodeDesc==='Success'){
                        const {lotId,bidAmount}=bidInfo
                        
                        let bidPresent=false
                        let theBid
                        for (let i = 0; i < 3; i++) {
                            let allMyBids=await getMyBids(859420)
                            theBid=allMyBids.filter(item=>item.lotId==lotId)[0]
                            console.log(theBid);

                            if(theBid){
                                bidPresent=true
                                const {memberBidStatus,myBid,vehicleIdentificationNumber}=theBid
                                const bidInf={current_status:memberBidStatus,
                                    bid_amount:myBid,VIN:vehicleIdentificationNumber,lot:lotId,
                                    timestamp
                                }
                                sendBidToServer(bidInf)
                                break 
                                
                            }
                            await sleep(1500)
                            
                        }
                       

    
                        
                        // addBid(bidInfo)
                    }
                    
                })
                

            } 
        })
    })

}
// OUT_BID HIGH_BIDDER  NEVER_BID

const getLotDetails=(lotId)=>{
    let lot=parseInt(lotId)
    return new Promise(async(resolve, reject) => {
        let lotUrl=`https://www.copart.com/public/data/lotdetails/solr/${lotId}`
        fetch(lotUrl,{
            method:'GET',
            // headers:Copart_Headers
            credentials: "include",
        }).then(async res=>{
            let resData=await res.json()
            resolve(resData.data.lotDetails);
            
        })

        
    })
}

// setTimeout(async() => {
//     let lotd=await getLotDetails(74245073)
//     console.log(lotd);
// }, 15000);

let lotDatas=[
    {"lotId":"39757774","bidAmount":"100","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"38967974","bidAmount":"150","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"80249503","bidAmount":"125","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"39757774","bidAmount":"200","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"67457733","bidAmount":"175","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"70678643","bidAmount":"250","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"40728424","bidAmount":"120","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"37214574","bidAmount":"140","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"81706763","bidAmount":"280","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"82988903","bidAmount":"300","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
    {"lotId":"82812513","bidAmount":"300","startingBid":"90","auctionId":7799055,"maxBid":"90",
    "currentBid":80,"currentMaxBid":0,"bidType":"counter_bid"},
   
]

const makefakeBid=()=>{
    return new Promise((resolve, reject) => {
        let chosenLot=lotDatas[Math.floor(Math.random()*lotDatas.length)]
        // let chosenLot=lotDatas.filter(item=>item.lotId=='39757774')[0]
        let postData=JSON.stringify([chosenLot])
        const fakeIntercept={
            data:{returnCodeDesc:'Success'},
            url:'pr',
            postData,
            timestamp:new Date().getTime()
        }

        let lotId=parseInt(chosenLot.lotId)

        let times=0

        chrome.tabs.create({url:`https://www.copart.com/lot/${lotId}/`},(createdTab)=>{
            chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{
                
                if(createdTab.id==tab.id){
                    if(changeInfo && changeInfo.status=='complete'){
                        times+=1
                        if(times<=2){
                            setTimeout(() => {
                                handleNewBid(fakeIntercept);
                            }, 10000);
                            
                        }
                        
                    }

                }
                    
            }
              )
        })

    })

}