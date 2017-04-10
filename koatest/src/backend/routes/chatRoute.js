const Router = require('koa-router'); 

const chatView = require('../views/chatView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');


const log = logger.log;

const api = Router();


api.use('/chat/public', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/chat/irc', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/chat/private', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);


api.get('chat_public', '/chat/public', chatView.ChatGetHandler); 
api.get('chat_irc', '/chat/irc', chatView.ChatGetHandler); 
api.get('chat_private', '/chat/private', chatView.ChatGetHandler); 


// api.post('chat', '/chat', chatView.ChatPostHandler); 


module.exports = api;