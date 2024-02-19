const getCsrfToken=()=>{
    return new Promise(async(resolve, reject) => {
        chrome.cookies.getAll({name:'csrftoken',domain:DOMAIN},ck=>{
            resolve (ck[0].value)
        })
    })
}

const apiFetch=(path,method,body)=>{
    return new Promise(async(resolve, reject) => {
        let csrfToken=await getCsrfToken()
        setTimeout(() => {
            resolve({error:true,message:'Slow network connection'})
        }, 20000);
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