const logger = require('../../lib/logger');
const utils = require('../../lib/utils');
const auth_helpers = require('../../lib/auth_helpers');
const redis = require('../../lib/redisclient');
const cache = require('../../lib/cache_handler');
const error = require('../../lib/error_handler');


const log = logger.log;



function func1(num, name, filled) {
	console.log('num : ', num);

	let $asd = document.createElement('div');

	document.body.appendChild($asd);

	num = num + 23;
	return filled;
}


functi(12, asd, 'adf');

let acat = [];
let ball = {
	adf: 13,
	toward: 'adfd',
	'fdf': 23,
	'fdfd': 'dfdf'
};

this.push(1);
this.splice(1, 3);

this.pusha(1);
this.splices(1, 3);


acat.push(1);
acat.splice(1, 3);

acat.pusha(1);
acat.splices(1, 3);



// Handler/Controller to handle route GET requests to profile page
const ProfileGetHandler = function *(next) {
    this.log.debug('Inside Profile Get Handler'); 

    let sess = this.session;
    let errorhandler = false;

  	utils.debug_log_req(this, sess);

  	if (!this.state.isAuthenticated){
  		// Redirect to login page
  		this.log.info('Redirecting to login page');
  		
  		// delete session since session to be there/persist for authenticated users
	  	// this.session = null;
  		sess.info = null;

  		this.redirect('/login');	
  	}
  	else {
  		// Render Profile page
  		this.time('render_profile_page');
  		
  		let username = this.params.username;
  		let user;

  		try {
	  		// find user
	  		if (username !== sess.info.username) {
	  			// It means the profile you want to view is not yours
	  			
	  			// Try to find user from redis cache
	  			user = yield cache.getUserInfoFromCacheByUsername(username);
				if (!user) {
					// something is wrong
					errorhandler = true;

					error.activate_error_middleware(this, 404);		
				}
	  			
	  		}
	  		else {
	  			// the profile you want to view is yours, hence get info from session
	  			user = sess.info;
	  		}


	  		if (!errorhandler) {

		  		// generate the token
		  		let token = yield auth_helpers.genSocketioToken(sess.info.userid);
		  		
		  		if (!token) {
		  			// make errorhandle true, so that status doesn't change and errohandler middleware is triggered
		  			errorhandler = true;

		  			error.activate_error_middleware(this, 500);	
		  		}
		  		else {
		  		
			  		// Get online status info of username from redis
					let online_status = yield cache.getUserOnlineStatusById(user.userid);
			  		  	
					// find notification count
		  			let notification_count = yield cache.get_notification_count(sess.info.userid);


					let user_info = {
						navbar: {
							name: sess.info.name,
							userid: sess.info.userid,
							username: sess.info.username,
							dp_thumbnail: sess.info.dp_thumbnail
						},
			      		name: user.name,
			      		username: user.username,
			      		userid: user.userid,
			      		dp_thumbnail: user.dp_thumbnail,
			      		bio: user.bio,
			      		followers: user.followers.length,
			      		following: user.following.length,
			      		status: online_status.status,
			      		lastseen: online_status.lastseen,
			      		notification_count: notification_count,
			      		token: token
			      	};
			  		
				  	this.set('X-Request-Id', this.reqId);
				  	this.render_marko('profile', user_info);				  	
				  	this.timeEnd('render_profile_page');
				  	
				  	this.log.debug('profile page rendered');

				}
			}

		}
		catch (err) {
			this.log.error('Error in processing profile page : ', err);
			errorhandler = true;

			error.activate_error_middleware(this, 500);	
		}

  		
  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};








// Handler/Controller to handle route POST requests to Chat view of profile of users
const GetProfileChatviewPostHandler = function *(next) {
    this.log.debug('Inside Profile Chat View Post Handler'); 

    let sess = this.session;
    let errorhandler = false;

  	utils.debug_log_req(this, sess);

  	if (!this.state.isAuthenticated){
  		// Redirect to login page
  		this.log.info('Redirecting to login page');
  		
  		// delete session since session to be there/persist for authenticated users
	  	// this.session = null;
  		sess.info = null;

  		let body = {
	    	status: 401,
	     	success: false,
	     	message: '/login'
	    };

	    body = JSON.stringify(body);

		this.status = 200;
	    this.body = body;

	    return;	
  	}
  	else {
  		// Render Profile page
  		
  		let userid = this.request.body.userid;
  		let user;

  		try {
	  		// find user
	  		if (userid !== sess.info.userid) {
	  			// It means the profile you want to view is not yours
	  			
	  			// Try to find user from redis cache
	  			user = yield cache.getUserInfoFromCacheById(userid);

				if (!user) {
					// something is wrong
					this.log.error('Error in processing profile page');

					let body = {
				    	status: 404,
				     	success: false,
				     	message: 'User Does not exist'
				    };

				    body = JSON.stringify(body);

					this.status = 200;
				    this.body = body;
					
					return;
				}
	  			
	  		}
	  		else {
	  			// the profile you want to view is yours, hence get info from session
	  			user = sess.info;
	  		}
	  		
	  		// Get online status info of username from redis
			let online_status = yield cache.getUserOnlineStatusById(user.userid);

	  		  			
			let user_info = {
	      		name: user.name,
	      		userid: user.userid,
	      		username: user.username,
	      		dp_thumbnail: user.dp_thumbnail,
	      		bio: user.bio,
	      		followers: user.followers.length,
	      		following: user.following.length,
	      		status: online_status.status,
	      		lastseen: online_status.lastseen
	      	};

	  		let body = {
		    	status: 200,
		     	success: true,
		     	message: user_info
		    };

		    body = JSON.stringify(body);

			this.status = 200;
		    this.body = body;

		    return;
		
		}
		catch (err) {
			this.log.error('Error : ', err);

			let body = {
		    	status: 500,
		     	success: false,
		     	message: 'Invalid user request'
		    };

		    body = JSON.stringify(body);

			this.status = 200;
		    this.body = body;

		    return;
		}

  		
  	}

  	if (!errorhandler) {
  		// if !errorhanlder, the make status as false else let the status remaid true, so that errorhandler middleware is triggered
	  	error.cancel_error_middleware(this);
	}

  	yield next;
};







exports.ProfileGetHandler = ProfileGetHandler;
exports.GetProfileChatviewPostHandler = GetProfileChatviewPostHandler;



