const Router = require('koa-router'); 

const relationshipView = require('../views/relationshipView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');


const log = logger.log;

const api = Router();


api.use('/relationship/follow', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/relationship/unfollow', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
// api.use('/relationship/block', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);


api.post('follow', '/relationship/follow', relationshipView.FollowPostHandler); 
api.post('unfollow', '/relationship/unfollow', relationshipView.UnfollowPostHandler); 
// api.post('block', '/relationship/block', relationshipView.FollowPostHandler); 



module.exports = api;