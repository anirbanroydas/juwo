const Router = require('koa-router'); 

const postView = require('../views/postView');
const sessionHandlers = require('../views/sessionHandlers');
const logger = require('../../lib/logger');


const log = logger.log;

const api = Router();


api.use('/post/create', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/post/delete', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/post/like', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/post/unlike', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/post/share', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/post/comment/add', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);
api.use('/post/comment/remove', sessionHandlers.generalSessionHandler, sessionHandlers.authSessionHanlder);


api.post('post_create', '/post/create', postView.PostCreatePostHandler); 
api.post('post_delete', '/post/delete', postView.PostDeletePostHandler); 
api.post('post_like', '/post/like', postView.PostLikePostHandler); 
api.post('post_unlike', '/post/unlike', postView.PostUnlikePostHandler); 
api.post('post_share', '/post/share', postView.PostSharePostHandler); 
api.post('post_comment_add', '/post/comment/add', postView.PostCommentAddPostHandler); 
api.post('post_comment_remove', '/post/comment/remove', postView.PostCommentRemovePostHandler); 



module.exports = api;