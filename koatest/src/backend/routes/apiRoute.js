const Router = require('koa-router'); 

const feedView = require('../views/feedView');
const timelineView = require('../views/timelineView');
const relationshipView = require('../views/relationshipView');
const notificationView = require('../views/notificationView');
const livestreamView = require('../views/livestreamView');
const profileView = require('../views/profileView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');


const log = logger.log;

const api = Router();


api.use('/api/v1/feed/home', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/api/v1/timeline/user', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/api/v1/notification/user', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/api/v1/notification/count', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/api/v1/livestream/user', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/api/v1/user/following', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/api/v1/user/followers', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/api/v1/user/chat_view', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);



api.post('feed_home', '/api/v1/feed/home', feedView.FeedHomePostHandler); 
api.post('timeline_user', '/api/v1/timeline/user', timelineView.TimelineUserPostHandler); 
api.post('notification_user', '/api/v1/notification/user', notificationView.NotificationUserPostHandler); 
api.post('notification_count', '/api/v1/notification/count', notificationView.NotificationCountPostHandler); 
api.post('livestream_user', '/api/v1/livestream/user', livestreamView.LivestreamUserPostHandler); 
api.post('user_following', '/api/v1/user/following', relationshipView.GetUserFollowingPostHandler); 
api.post('user_followers', '/api/v1/user/followers', relationshipView.GetUserFollowersPostHandler); 
api.post('user_chat_view', '/api/v1/user/chat_view', profileView.GetProfileChatviewPostHandler); 



module.exports = api;