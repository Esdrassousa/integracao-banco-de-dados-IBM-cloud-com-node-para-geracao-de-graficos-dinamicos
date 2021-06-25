const express = require('express')
require('dotenv').config()
const router = express.Router();
const Cloudant = require('@cloudant/cloudant');
const { all } = require('async');
//const  url  = "https://apikey-v2-2i7l0qp9wwbw87vpija9mi31o7yennrevo7fd87xpz00:974d78d495165a06f9f8a753ffe33542@42b86470-c6b5-4354-813b-727ba9f47dce-bluemix.cloudantnosqldb.appdomain.cloud";
const  url  = process.env.URL_IMB;

const cors = require('cors');
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const route =  router.post('/', jsonParser , async (request,response) =>{
   

    const {min}  = request.body
    
    console.log(process.env.KEY_IAM)
    
    try{
        const cloudant = Cloudant({
            url:url,
            plugins:{
                iamauth:{
                    //iamApiKey:"zAOvP080YFlleja6dHriE4WzpiPUoUJh9o-VeMpbTqPy"
                    iamApiKey : process.env.KEY_IAM
                }
            }
        })
        let allbd = await cloudant.db.list();
        console.log(`${allbd}`)
        const db = cloudant.db.use(process.env.BD)

        ///////data/////////////////////
        const data  =  new Date()
        mes_atual = data.getMonth()+1
        dia_atual  = data.getDate()
        ano_atual  = data.getFullYear()
        horas_atual = data.getHours() - 3
        horas_atual = ((horas_atual < 10) ? '0' : '') + horas_atual
        minutes_atual  = data.getMinutes()
        minutes_atual = ((minutes_atual < 10)? '0': '')+minutes_atual
        horas_anterior = horas_atual

        if( min > minutes_atual){

            horas_anterior = horas_atual - 1
            horas_anterior = ((horas_anterior < 10) ? '0' : '') + horas_anterior
            minute_anterior = 59 -  (min - minutes_atual)
            minute_anterior  = ((minute_anterior < 10) ? '0': '') + minute_anterior

            
        }else{
            minute_anterior = minutes_atual -  min
            minute_anterior = ((minute_anterior < 10) ? '0' : '' ) + minute_anterior
        }
        
        



        data_completa_atual =  mes_atual + '/' + dia_atual + '/' + ano_atual + ',' + ' ' +  horas_atual + ":" + minutes_atual + ":" +'00'
        data_completa_anterior =  mes_atual + '/' + dia_atual + '/' + ano_atual + ',' + ' ' +  horas_anterior + ":" + minute_anterior + ":" +'00'

        console.log('data atual: ',(String(data_completa_atual)))
        console.log('data anterio : ', (String(data_completa_anterior)))
        ////////////////////////////////
        res =  await db.find({ selector : {_id: { $gt: (String(data_completa_anterior)) , $lt: (String(data_completa_atual)) } }})   
        //res =  await db.find({ selector : {_id: { $gt: '6/23/2021, 14:07:00' , $lt: '6/23/2021, 15:57:00' } }})   

        
        
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

        response.setHeader('Access-Control-Allow-Origin', process.env.URL);
        response.setHeader('Access-Control-Allow-Credentials', true);
      

       
        await response.status(200).send(vetor);
        
        
       
      
    }catch(err){
        console.log(err);
    }
    

})

module.exports =route
