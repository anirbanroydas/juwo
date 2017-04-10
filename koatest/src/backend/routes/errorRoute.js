const Router = require('koa-router'); 

const errorView = require('../views/errorView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');


const log = logger.log;

const api = Router();


api.use('/error', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/404', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);



api.post('error', '/error', errorView.ErrorGetHandler); 
api.post('error_404', '/404', errorView.ErrorGetHandler); 
// api.post('block', '/relationship/block', relationshipView.FollowPostHandler); 



module.exports = api;