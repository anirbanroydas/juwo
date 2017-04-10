const bluebird = require('bluebird');
const bcrypt = require('bcrypt'); 

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;
const utils = require('./utils');
const redis = require('./redisclient');
// const DB = require('./db');

const log = logger.log;


bluebird.promisifyAll(bcrypt);


// const db = new DB();


class Helpers {
	
	// method for comparing password
	static comparePass(userPassword, databasePassword) {
		
		let comparePassGenerator = function *(userPassword, databasePassword) {	
			log.debug('campare pass coroutine called ');
			log.debug('userPassword : ', userPassword);
			log.debug('databasePassword : ', databasePassword);
			
			let isValid;
			
			try {
				isValid =  yield bcrypt.compareAsync(userPassword, databasePassword);
				log.debug(' isValid : ', isValid);
				
			}
			catch(err) {
				log.error('Error : ', err);
				isValid = false;
			}

			return new bluebird(function(resolve, reject) {
		  		resolve(isValid);
		  	});

		};


		let comparePassCoroutine = bluebird.coroutine(comparePassGenerator);

		// call the coroutine
		return comparePassCoroutine(userPassword, databasePassword);

	}





	// method for creating password
	static createPassword(password) {
		
		let createPasswordGenerator = function *(password) {
		  	log.debug('create pass called ');
			log.debug('Password : ', password);
		  	
		  	let hash;

		  	try {
		    	let salt = yield bcrypt.genSaltAsync();
		    	hash = yield bcrypt.hashAsync(password, salt);
		    	log.debug('hash : ', hash);
		    	  
		  	}
		  	catch(err) {
		  		log.error('Error : ', err);
		    	//res.status(400).json({status: err.message});
		    	
		    	hash = false;
		  	}

		  	return new bluebird(function(resolve, reject) {
		  		if (!hash) {
		  			resolve(false);
		  		}
		  		else {
		  			resolve(hash);
		  		}
		  	});
		};
		

		let createPasswordCoroutine = bluebird.coroutine(createPasswordGenerator);

		// call the coroutine
		return createPasswordCoroutine(password);
	
	}








	// method to generate token socket io authentication
	static genSocketioToken(userid) {

		let genSocketioTokenGenerator = function *(userid) {
			log.debug('inside genSocketioToken -> generator function');
			log.debug('userid : ', userid);

			let result = false;
			let value = utils.genid(32);
			let key = 'koatest:socketio:auth:token:' + userid;
			
			try {

				log.debug('redis set Async called');
				let redisSet = yield redis.setAsync(key, value);
				log.debug('redis set Async sucessfullt');
				
				log.debug('redis expire Async called');
				let expire = yield redis.expireAsync(key, 20);
				log.debug('redis expire Async sucessfullt');
				
				result = true;

			}
			catch (err){
				log.error('Error: ', err);
				result = false;
			}

			return new bluebird(function(resolve, reject) {
				if (result) {
					resolve(value);
				}
				else {
					resolve(false);
				}
				
			});
		};
	
		
		let genSocketioTokenCoroutine = bluebird.coroutine(genSocketioTokenGenerator);
		
		// run the coroutine
		return genSocketioTokenCoroutine(userid);
	}







	// method to compare token and athenticate the socket io connection token
	static compareSocketioToken(userid, token) {

		let compareSocketioTokenGenerator = function *(userid, token) {
			log.debug('inside compareSocketioTokenGenerator -> generator function');
			log.debug('userid : ', userid);
			
			let result = false;

			try {
				
				let key = 'koatest:socketio:auth:token:' + userid;

				log.debug('redis get Async called');
				let value = yield redis.getAsync(key);
				log.debug('redis get Async sucessfullt');
				
				if (!value) {
					result = null;
				}
				else {
					if (value === token) {
						result = true;
					}
					else {
						result = false;
					}
				}
			}
			catch (err){
				log.error('Error: ', err);
				result = null;
			}

			return new bluebird(function(resolve, reject) {
				resolve(result);
			});
		
		};
	
		
		let compareSocketioTokenCoroutine = bluebird.coroutine(compareSocketioTokenGenerator);
		
		// run the coroutine
		return compareSocketioTokenCoroutine(userid, token);
	}





}
	





module.exports = Helpers;


