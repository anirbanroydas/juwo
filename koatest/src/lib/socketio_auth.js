const bluebird = require('bluebird');
const socketio_auth = require('socketio-auth');

const auth_helpers = require('./auth_helpers');
const logger = require('./logger');
const redis = require('./redisclient');
const CONFIG = require('./settings').CONFIG_DATA;



const log = logger.log;






class SocketioAuth {
	


	static authenticate(socket, data, callback) {

		let authenticateGenerator = function *(socket, data, callback) {
			log.debug('[SocketIO_Auth] inside authenticate');
			log.info('Socket: ' + socket.id + ' is authenticating...');

			let userid = data.userid;
	  		let token = data.token;
	  		
	  		log.debug('userid : ', userid);
	  		log.debug('token : ', token);

	  		let isValid = yield auth_helpers.compareSocketioToken(userid, token);

	  		if (isValid === null) {
	  			return callback(new Error("User not found"));
	  		}
	  		else {
	  			return callback(null, isValid);
	  		}
	  		 
		};


		let authenticateCoroutine = bluebird.coroutine(authenticateGenerator);
			
		// run the coroutine
		return authenticateCoroutine(socket, data, callback);
		
	}




	static close(ctx, userid) {
		
		let close_Generator = function *(ctx, userid) {
			
			log.debug('[SocketIO_Auth] inside close_Generator');
			log.info('closing socket for userid: ', userid);

			let result = true;
			
			try {
				let key = 'koatest:socketio:socket_id:' + userid;

				log.debug('redis get Async called');
				let socket_id = yield redis.getAsync(key);
				log.debug('redis get Async sucessfullt');
				
				let socket = null;

				if (!value) {
					result = false;
				}
				else {
					socket = ctx.io.sockets.sockets[socket_id];
				}

				if (!socket) {
					result = false;
				}
		  		else {
		  			socket.disconnect();
		  		}
		  	
		  	}
		  	catch (err) {
		  		log.error('Error in disconnecting socket : ', err);
		  		result = false;
		  	}

	  		return new bluebird(function(resolve, reject) {
	  			resolve(result);
	  		});	  		 
		};


		let close_Coroutine = bluebird.coroutine(close_Generator);
			
		// run the coroutine
		return close_Coroutine(ctx, userid);
	  		
	}





	static auth(io, socketio_auth_opts) {
		
		socketio_auth(io, socketio_auth_opts);
	}


}












module.exports = SocketioAuth;

