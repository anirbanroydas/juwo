const logger = require('../../lib/logger');

const log = logger.log;

// General Session Handler/Controller to handle all sessions 
const generalSessionHandler = function *(next) {
	let sess = this.session;

	sess.stats = sess.stats || null;

	if (sess.stats === null) {
		// first time session data creation
		sess.stats = {
			total_count : 0,
			index_count : 0,
			home_count : 0,
			chat_count : 0,
			login_count : 0,
			login_attempts : 0,
			signup_count: 0,
			signup_attempts: 0,
			successfull_attempts : 0,
			unsuccessfull_attempts : 0,
			unauthenticated_req_count : 0,
			authenticated_req_count : 0
  		};
  	}

  	sess.stats.total_count++;

  	yield next;
  	
};



// session hanlder to handle authorizations
const authSessionHanlder = function *(next) {
	let sess = this.session;

	sess.info = sess.info || null;
	this.state = this.state || {};

	if (sess.info === null || !sess.info.isValid) {
		this.log.debug('Unauthorized user.');
		
		this.state.isAuthenticated = false;
		sess.stats.unauthenticated_req_count++;	
	}
	else {
		this.log.debug('Autorized request.');
		
		this.state.info = sess.info;
		this.state.isAuthenticated = true;
		sess.stats.authenticated_req_count++;
	}

	yield next;
};




exports.generalSessionHandler = generalSessionHandler;
exports.authSessionHanlder = authSessionHanlder;

