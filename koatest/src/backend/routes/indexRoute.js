const Router = require('koa-router'); 

const indexView = require('../views/indexView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');



const log = logger.log;

const api = Router();


api.use('/', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);


api.get('index', '/', indexView.IndexGetHandler); 




module.exports = api;