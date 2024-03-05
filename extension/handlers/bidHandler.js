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
    chrome.storage.local.get(['userCurrentBids','MEMBER_NUMBER'],async res=>{
        if(res.userCurrentBids && res.MEMBER_NUMBER){
            let myBids=await getMyBids(res.MEMBER_NUMBER)
            res.userCurrentBids.forEach(userBid=>{
               let theBid=myBids.filter(item=>item.lotId==userBid.lot)
               let {current_status,bid_amount,VIN,lot,username}=userBid
               if(theBid && theBid[0]){
                    
                    current_status=current_status.toLowerCase()
                    let formerAmount=parseFloat(bid_amount)

                    let {memberBidStatus,myBid,myMaxBid,vehicleIdentificationNumber,currentBid}=theBid[0]
                    memberBidStatus=memberBidStatus.toLowerCase()
                    let actualBidAmount=Math.max(myBid,myMaxBid)

                    if((actualBidAmount!=formerAmount) || 
                    memberBidStatus!=current_status){
                        const bidInf={
                            current_status:memberBidStatus,
                            bid_amount:actualBidAmount,
                            VIN,lot,username,timestamp
                        }
                        updateBid(bidInf)
                    }
                    
                }else{
                    const bidInf={current_status:"lost",bid_amount,VIN,lot,username,timestamp}
                    updateBid(bidInf)
                }
            })

            

            
        }
    })
}


const updateBid=(bidInfo)=>{
    
    return new Promise(async(resolve, reject) => {

        chrome.storage.local.get(['MEMBER_NUMBER','USERNAME','PWD'],async res=>{
            if(res.MEMBER_NUMBER){
                const {USERNAME,PWD}=res
                member_number=res.MEMBER_NUMBER

                let theBid=JSON.stringify(bidInfo)
                let params=`?theBid=${theBid}&us=${USERNAME}&pwd=${PWD}`
                let fullUrl=`bids/update/${member_number}${params}`
                let response = await apiFetch(fullUrl,'GET')
                console.log('Updated bid',response);
                if(response.currentBids){
                    chrome.storage.local.set({userCurrentBids:response.currentBids})
                }
                
            }
        })

       
        
        
    })
}

const sendBidToServer=(bidInfo)=>{
    
    return new Promise(async(resolve, reject) => {

        chrome.storage.local.get(['MEMBER_NUMBER','USERNAME','PWD'],async res=>{
            if(res.MEMBER_NUMBER){
                const {USERNAME,PWD}=res
                member_number=res.MEMBER_NUMBER
                let theBid=JSON.stringify(bidInfo)
                let params=`?theBid=${theBid}&us=${USERNAME}&pwd=${PWD}`
                let fullUrl=`bids/add/${member_number}${params}`
                let response = await apiFetch(fullUrl,'GET')
                console.log('Bid sent to server',response);
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
        let bidInfos=JSON.parse(postData)
        bidInfos.forEach(async lotObj=>{
            const {lotId,bidAmount}=lotObj
            let rawLotInfo=await getLotDetails(parseInt(lotId))
            let bidObj={
                current_status:'WINNING',
                bid_amount:bidAmount,
                VIN:rawLotInfo.fv,
                lot:lotId,
                timestamp
            }
            sendBidToServer(bidObj)
        })
    }
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