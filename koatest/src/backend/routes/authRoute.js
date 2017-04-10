const Router = require('koa-router'); 

const authView = require('../views/authView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');



const log = logger.log;

const api = Router();


api.use('/login', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/logout', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/signup', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);


api.get('login', '/login', authView.LoginGetHandler); 
api.post('login', '/login', authView.LoginPostHandler); 


api.post('logout', '/logout', authView.LogoutPostHandler); 


api.get('signup', '/signup', authView.SignupGetHandler); 
api.post('signup', '/signup', authView.SignupPostHandler); 


module.exports = api;