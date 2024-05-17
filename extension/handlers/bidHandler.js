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
               current_status=current_status.toLowerCase()
               if(theBid && theBid[0]){
                    
                    
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
                    if(current_status!='outbid'){
                        const bidInf={current_status:"outbid",bid_amount,VIN,lot,username,timestamp}
                        updateBid(bidInf)
                    }
                    
                    
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
                console.log('Sending Bid');
                const {USERNAME,PWD}=res
                member_number=res.MEMBER_NUMBER
                let theBid=JSON.stringify(bidInfo)
                let params=`?theBid=${theBid}&us=${USERNAME}&pwd=${PWD}`
                let fullUrl=`bids/add/${member_number}${params}`
                let response = await apiFetch(fullUrl,'GET')
                console.log('Bid sent to server',response);
                if(response.currentBids){
                    chrome.storage.local.set({userCurrentBids:response.currentBids},()=>{
                        resolve('DONE')
                    })
                }
                
            }else{
                console.log('NO MEMBER NUMBER');
            }
        })
        
        
        
    })
}

const handleNewBid=async(bidData)=>{
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

const handleLiveBid=async(bidData)=>{
    const {data,url,timestamp}=bidData
    const actualData=data.data.saleMessages

    const {bidRecMessage,curItemMessage,prebidMessagePerLot}=actualData
    // console.log("bidRecMessage",bidRecMessage);
    let {LOTNO,CURBID}=bidRecMessage
    let lotId=LOTNO.replace(/^0+/, '') || '0';
    let rawLotInfo=await getLotDetails(parseInt(lotId))

    let bidObj={
        current_status:'WINNING',
        bid_amount:CURBID,
        VIN:rawLotInfo.fv,
        lot:lotId,
        timestamp
    }

    await sendBidToServer(bidObj)
    checkCurrentBids(timestamp)

    // console.log(bidObj);
    // console.log(rawLotInfo);
    // console.log('curItemMessage',curItemMessage);
    // console.log('prebidMessagePerLot',prebidMessagePerLot);

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


const breakdownJson=(jFile)=>{
    console.log(1,Object.keys(jFile));
    const {data}=jFile.data

    // console.log(2,Object.keys(data.data));
    console.log(data);
}

handleLiveBid({
    "url": "https://g2auction.copart.com/g2/authenticate/api/v1/sale/messages/COPART169A",
    "data": {
        "data": {
            "saleMessages": {
                "curItemMessage": {
                    "@class": "com.copart.auction.messagerecords.CURITEMMessage",
                    "EMPTY": false,
                    "FORMATNAME": "CURITEM",
                    "LOTNO": "0045867394",
                    "TOTUSERS": "0",
                    "BUYERNO": "496756",
                    "APRFLG": "N",
                    "STARTBID": "425",
                    "SVRTIME": "1829",
                    "DAMAGE": "TNUSA",
                    "CERTCODE": "",
                    "CURRENCY": "USD",
                    "LOSSCODE": "",
                    "DESC1": "Color",
                    "LDESC1": "Color",
                    "VALUE1": "BLACK",
                    "DESC2": "VIN",
                    "LDESC2": "VIN",
                    "VALUE2": "",
                    "DESC3": "Engine",
                    "LDESC3": "Engine",
                    "VALUE3": "2.5L  4",
                    "DESC4": "Mileage",
                    "LDESC4": "Mileage",
                    "VALUE4": "49494",
                    "DESC5": "ACV",
                    "LDESC5": "ACV",
                    "VALUE5": "0.000",
                    "DESC6": "Repair",
                    "LDESC6": "Repair",
                    "VALUE6": "0.000",
                    "DESC7": "Title",
                    "LDESC7": "Title",
                    "VALUE7": "ST-CERT OF TITLE-SALVAGE TITLE",
                    "DESC8": "Damage",
                    "LDESC8": "Damage",
                    "VALUE8": "Front End",
                    "DESC9": "",
                    "LDESC9": "",
                    "VALUE9": "",
                    "DESC10": "",
                    "LDESC10": "",
                    "VALUE10": "",
                    "ADLINE": "",
                    "MAXBID": "8999999",
                    "DEGRADEDMODEENABLED": false,
                    "LOCATION": "",
                    "YARDNAME": "IA - DAVENPORT",
                    "AUCYEAR": "2024",
                    "AUCMON": "5",
                    "AUCDAY": "15",
                    "ITEMNO": "103",
                    "DESCRIPT": "2013 FORD FUSION S",
                    "ENGINE": "2.5L  4",
                    "COLOR": "BLACK",
                    "VIN": "",
                    "MILEAGE": "49494",
                    "BRAND": "",
                    "ACV": "0",
                    "REPCOST": "0",
                    "TITLETYPE": "ST-CERT OF TITLE-SALVAGE",
                    "OKTOBID": "",
                    "PIXCNT": "12",
                    "IMGPATH": ""
                },
                "countDownTime": -5398,
                "errorMessage": "",
                "bidRecMessage": {
                    "@class": "com.copart.auction.messagerecords.BIDRECMessage",
                    "EMPTY": false,
                    "FORMATNAME": "BIDREC",
                    "BUYERST": "IA",
                    "BUYERCTR": "USA",
                    "MINMET": "Y",
                    "TOKEN": "",
                    "LOTNO": "0045867394",
                    "BUYERNO": "237722",
                    "APRFLG": "N",
                    "TYPE": "V",
                    "CURBID": "1200",
                    "IPADDRESS": "",
                    "NEXT": "1250"
                },
                "bidCountdownTime": 12,
                "firstLotCountdownTime": 20,
                "otherLotCountdownTime": 17,
                "saleStarted": true,
                "audioOn": false,
                "soldLots": 0,
                "delaySeconds": 0,
                "bonusTimeClicks": 37,
                "bonusTimePerLotClick": 0,
                "bonusTimePercent": 0,
                "prebidMessagePerLot": {
                    "38289434": {},
                    "38533634": {},
                    "39145134": {},
                    "39976464": {},
                    "40624614": {},
                    "41002934": {},
                    "41246654": {},
                    "42086754": {},
                    "42512094": {},
                    "42520454": {},
                    "42777534": {},
                    "43563724": {},
                    "43885594": {},
                    "44343874": {},
                    "44891174": {},
                    "44892694": {},
                    "45099084": {},
                    "45424724": {},
                    "45686214": {},
                    "45867394": {
                        "@class": "com.copart.auction.messagerecords.PREBIDMessage",
                        "EMPTY": false,
                        "FORMATNAME": "PREBID",
                        "SITECODE": "CPRTUS",
                        "BUYERST": "",
                        "EVENTCODE": "PRCD",
                        "BUYERCTR": "",
                        "MINMET": "Y",
                        "TOKEN": "",
                        "LOTNO": "45867394",
                        "BUYERNO": "496756",
                        "APRFLG": "N",
                        "TYPE": "P",
                        "IPADDRESS": "",
                        "PREBID": "425"
                    },
                    "46019064": {},
                    "46085524": {},
                    "46187604": {},
                    "46339954": {},
                    "46380834": {},
                    "47117664": {},
                    "47153074": {},
                    "47529754": {},
                    "47611614": {},
                    "47830504": {},
                    "47875264": {},
                    "47885354": {},
                    "47887614": {},
                    "47889964": {},
                    "48063624": {},
                    "48111274": {},
                    "48150054": {},
                    "48226684": {},
                    "48340324": {},
                    "48470844": {},
                    "48480044": {},
                    "48536354": {},
                    "48558294": {},
                    "48566394": {},
                    "48672034": {},
                    "48681394": {},
                    "48700934": {},
                    "48847044": {},
                    "48870124": {},
                    "48926134": {},
                    "49013394": {},
                    "49101594": {},
                    "49336104": {},
                    "49342384": {},
                    "49425324": {},
                    "49585614": {},
                    "49612244": {},
                    "49694594": {},
                    "49717654": {},
                    "49766704": {},
                    "49799034": {},
                    "49801674": {},
                    "49830124": {},
                    "49853724": {},
                    "49905624": {},
                    "49935474": {},
                    "49990384": {},
                    "51173414": {},
                    "51259184": {},
                    "51907064": {},
                    "51957774": {},
                    "51968614": {
                        "@class": "com.copart.auction.messagerecords.PREBIDMessage",
                        "EMPTY": false,
                        "FORMATNAME": "PREBID",
                        "SITECODE": "CPRTUS",
                        "BUYERST": "",
                        "EVENTCODE": "PRCD",
                        "BUYERCTR": "",
                        "MINMET": "N",
                        "TOKEN": "",
                        "LOTNO": "51968614",
                        "BUYERNO": "404184",
                        "APRFLG": "N",
                        "TYPE": "P",
                        "IPADDRESS": "",
                        "PREBID": "550"
                    },
                    "52011974": {},
                    "52595634": {},
                    "52620654": {},
                    "52770494": {
                        "@class": "com.copart.auction.messagerecords.PREBIDMessage",
                        "EMPTY": false,
                        "FORMATNAME": "PREBID",
                        "SITECODE": "CPRTUS",
                        "BUYERST": "",
                        "EVENTCODE": "PRCD",
                        "BUYERCTR": "",
                        "MINMET": "Y",
                        "TOKEN": "",
                        "LOTNO": "52770494",
                        "BUYERNO": "909187",
                        "APRFLG": "Y",
                        "TYPE": "P",
                        "IPADDRESS": "",
                        "PREBID": "475"
                    },
                    "52998514": {},
                    "53142284": {},
                    "54187834": {
                        "@class": "com.copart.auction.messagerecords.PREBIDMessage",
                        "EMPTY": false,
                        "FORMATNAME": "PREBID",
                        "SITECODE": "CPRTUS",
                        "BUYERST": "",
                        "EVENTCODE": "PRCD",
                        "BUYERCTR": "",
                        "MINMET": "Y",
                        "TOKEN": "",
                        "LOTNO": "54187834",
                        "BUYERNO": "824025",
                        "APRFLG": "Y",
                        "TYPE": "P",
                        "IPADDRESS": "",
                        "PREBID": "350"
                    },
                    "54377674": {},
                    "54640554": {
                        "@class": "com.copart.auction.messagerecords.PREBIDMessage",
                        "EMPTY": false,
                        "FORMATNAME": "PREBID",
                        "SITECODE": "CPRTUS",
                        "BUYERST": "",
                        "EVENTCODE": "PRCD",
                        "BUYERCTR": "",
                        "MINMET": "N",
                        "TOKEN": "",
                        "LOTNO": "54640554",
                        "BUYERNO": "237722",
                        "APRFLG": "N",
                        "TYPE": "P",
                        "IPADDRESS": "",
                        "PREBID": "650"
                    },
                    "80801053": {},
                    "82131393": {}
                },
                "messageReceived": true
            }
        }
    },
    "timestamp": 1715797800193
})