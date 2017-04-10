const koacsrf = require('koa-csrf');
const csrf = require('csrf');

let options = {
	saltLength: 16,
	secretLength: 32,
	disableQuery: true
};


let custom_middleware = function* (next) {
	this.log.debug('Inside CSRF handler Middlware');

	this.log.debug('this.request.body : ', this.request.body);

	this.log.debug('adding error status as true so as to not skip error middleware');
	this.log.debug('if route is reached, the error status will become false');
  	this.state = this.state || {};
  	this.state.error = this.state.error || {};
  	this.state.error.status = true;
  	
  	this.log.debug('this.state : ', this.state);

	// ignore get, head, options
  	if (this.method === 'GET' || this.method === 'HEAD' || this.method === 'OPTIONS' ||
  		((this.url !== '/login' || this.url !== '/login/') &&
  		(this.url !== '/signup' || this.url !== '/signup/') &&
  		(this.url !== '/settings/profile' || this.url !== '/settings/profile/'))) 
  	{
	    
	    return yield* next;
	}

  	// bodyparser middlewares maybe store body in request.body
  	// or you can just set csrf token header
  	this.assertCSRF(this.request.body);


	yield* next;
};



exports.tokens = csrf(options);
exports.options = options;
exports.csrf = koacsrf;
exports.middleware =  custom_middleware;