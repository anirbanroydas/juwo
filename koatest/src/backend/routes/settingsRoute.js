const Router = require('koa-router'); 

const settingsView = require('../views/settingsView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');


const log = logger.log;

const api = Router();


api.use('/settings/profile', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
// api.use('/settings/account', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
// api.use('/settings/privacy', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);


api.get('settings_profile', '/settings/profile', settingsView.ProfileSettingsGetHandler); 
api.post('settings_profile', '/settings/profile', settingsView.ProfileSettingsPostHandler); 


// api.get('settings_account', '/settings/account', settingsView.AccountSettingsetGetHandler); 
// api.get('settings_account', '/settings/account', settingsView.AccountSettingsPostHandler); 


// api.get('settings_privacy', '/settings/privacy', settingsView.PrivacySettingsetGetHandler); 
// api.get('settings_privacy', '/settings/privacy', settingsView.PrivacySettingsPostHandler); 


module.exports = api;