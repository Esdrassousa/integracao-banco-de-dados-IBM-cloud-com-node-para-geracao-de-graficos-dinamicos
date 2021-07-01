const express = require('express')
require('dotenv').config()
const router = express.Router();
const Cloudant = require('@cloudant/cloudant');
const { all } = require('async');
const  url  = process.env.URL_IMB;

const cors = require('cors');
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const route =  router.post('/', jsonParser , async (request,response) =>{
   

    const {minutes_recebidos}  = request.body
    var minutes_recebidos_int = parseInt(minutes_recebidos)
    console.log(minutes_recebidos_int)
    
    try{
        const cloudant = Cloudant({
            url:url,
            plugins:{
                iamauth:{
                    
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

        horas_atual = data.getHours()

        if (horas_atual == 0){
            horas_atual = 21
        }

        if (horas_atual == 1){
            horas_atual = 22
        }

        if (horas_atual == 2){
            horas_atual = 23
        }
        else{

            horas_atual = data.getHours() - 0
        }
        horas_atual = ((horas_atual < 10) ? '0' : '') + horas_atual
        minutes_atual  = data.getMinutes() + 2
        minutes_atual = ((minutes_atual < 10)? '0': '')+minutes_atual
        horas_anterior = horas_atual
        diminui = minutes_recebidos_int - minutes_atual
        console.log(minutes_recebidos_int > minutes_atual , diminui,minutes_recebidos_int,minutes_atual)

        
        
        if(minutes_recebidos_int > minutes_atual){

            console.log('entrou aqui', minutes_recebidos_int)
            horas_anterior = horas_atual - 1
            horas_anterior = ((horas_anterior < 10) ? '0' : '') + horas_anterior
            minute_anterior = 59 -  (minutes_recebidos_int - minutes_atual)
            console.log(minute_anterior)
            minute_anterior  = ((minute_anterior < 10) ? '0': '') + minute_anterior

            
        }else{
            minute_anterior = minutes_atual -  minutes_recebidos_int
            minute_anterior = ((minute_anterior < 10) ? '0' : '' ) + minute_anterior
            

        }
        
        

        
        data_completa_atual =  mes_atual + '/' + dia_atual + '/' + ano_atual + ',' + ' ' +  horas_atual + ":" + minutes_atual + ":" +'59'
        data_completa_anterior =  mes_atual + '/' + dia_atual + '/' + ano_atual + ',' + ' ' +  horas_anterior + ":" + minute_anterior + ":" +'00'

        console.log('data atual: ',(String(data_completa_atual)))
        console.log('data anterio : ', (String(data_completa_anterior)))
        ////////////////////////////////
        function delay_tempo(segundos){
            var start = new Date().getTime();
            var end = start

            while(end > start - segundos){
                start =  new Date().getTime()
            }

        }

        //delay_tempo(3000)
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
        
        
        console.log(vetor.slice((vetor.length  - 5),(vetor.length)))
      
    }catch(err){
        console.log(err);
    }
    

})

module.exports =route
