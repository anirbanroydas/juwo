const Router = require('koa-router'); 

const profileView = require('../views/profileView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');


const log = logger.log;

const api = Router();


api.use('/:username', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);


api.get('profile', '/:username', profileView.ProfileGetHandler); 


module.exports = api;