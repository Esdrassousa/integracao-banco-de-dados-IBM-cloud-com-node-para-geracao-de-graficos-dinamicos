const http = require('http')
const debug = require('debug')('nodestr:serve')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app  = express();
//const router = express.Router()
app.use(cors());
const index = require('./routes/index')
app.use(express.urlencoded({extended: false}));
app.use('/', index)
app.use(bodyParser.json())
app.use(express.json())

const { createProxyMiddleware } = require('http-proxy-middleware');

const create = index.delete       ('/a' , (req, res, next) =>{
    res.status(201).send(req.body)
})
/* const put = router.put('/' , (req, res, next) =>{
    const id = req.params.id;
    res.status(200).send({
        id:id,
        item: req.body
    })
}) */


module.exports = app