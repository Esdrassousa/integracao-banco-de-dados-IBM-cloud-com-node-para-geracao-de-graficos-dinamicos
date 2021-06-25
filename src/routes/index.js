const express = require('express')
const router = express.Router();
const Cloudant = require('@cloudant/cloudant');
const { all } = require('async');
const  url  = "https://apikey-v2-2i7l0qp9wwbw87vpija9mi31o7yennrevo7fd87xpz00:974d78d495165a06f9f8a753ffe33542@42b86470-c6b5-4354-813b-727ba9f47dce-bluemix.cloudantnosqldb.appdomain.cloud";
const cors = require('cors');
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const route =  router.post('/', jsonParser , async (request,response) =>{
   

    const {min}  = request.body
    
    console.log(min)
    //console.log('o valor de min é: ' , min)
    //min = parseInt(min)
    try{
        const cloudant = Cloudant({
            url:url,
            plugins:{
                iamauth:{
                    iamApiKey:"zAOvP080YFlleja6dHriE4WzpiPUoUJh9o-VeMpbTqPy"
                }
            }
        })
        let allbd = await cloudant.db.list();
        console.log(`${allbd}`)
        const db = cloudant.db.use("amazenacorrente")

        ///////data/////////////////////
        const data  =  new Date()
        mes_atual = data.getMonth()+1
        dia_atual  = data.getDate()
        ano_atual  = data.getFullYear()
        horas_atual = data.getHours()
        horas_atual = ((horas_atual < 10) ? '0' : '') + horas_atual
        minutes_atual  = data.getMinutes()
        horas_anterior = horas_atual

        if( min > minutes_atual){
            horas_anterior = horas_atual - 1
            minute_anterior = 59 -  (minutes_atual - min)*(-1)

            
        }else{
            minute_anterior = minutes_atual -  min
            minute_anterior = ((minute_anterior< 10) ? '0' : '' ) + minute_anterior
        }
        
        



        data_completa_atual =  mes_atual + '/' + dia_atual + '/' + ano_atual + ',' + ' ' +  horas_atual + ":" + minutes_atual + ":" +'00'
        data_completa_anterior =  mes_atual + '/' + dia_atual + '/' + ano_atual + ',' + ' ' +  horas_atual + ":" + minute_anterior + ":" +'00'

        
        ////////////////////////////////
        res =  await db.find({ selector : {_id: { $gt: (String(data_completa_anterior)) , $lt: (String(data_completa_atual)) } }})   
        //res =  await db.find({ selector : {_id: { $gt: '6/23/2021, 14:07:00' , $lt: '6/23/2021, 15:57:00' } }})   

        console.log((String(data_completa_anterior)))
        
        res = res['docs']
        //console.log('o valor é: ' , res[1])
        tamanho = res.length
        //console.log(tamanho)
        vetor =[['', 'corrente']]
        for(i=0; i<tamanho ; i++){
           res1 = res[i]['_id'] 
           const splits = res1.split(',')
           resI = res[i]    
           //console.log('aqui é: ', resI)
           vetor.push([resI['data'],parseFloat(resI['ia'])])
        }
 //console.log(vetor.slice(0,10))

        response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
        response.setHeader('Access-Control-Allow-Credentials', true);
      

       
        await response.status(200).send(vetor);
        
        
       
      
    }catch(err){
        console.log(err);
    }
    

})

module.exports =route
