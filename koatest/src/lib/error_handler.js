var codes = require ('http').STATUS_CODES;
var boom = require ('boom');

const utils = require('./utils');




const ERROR_CODES = {
    
    '100': 'Continue',
    '101': 'Switching Protocols',
    '102': 'Processing',
    '200': 'OK',
    '201': 'Created',
    '202': 'Accepted',
    '203': 'Non-Authoritative Information',
    '204': 'No Content',
    '205': 'Reset Content',
    '206': 'Partial Content',
    '207': 'Multi-Status',
    '300': 'Multiple Choices',
    '301': 'Moved Permanently',
    '302': 'Moved Temporarily',
    '303': 'See Other',
    '304': 'Not Modified',
    '305': 'Use Proxy',
    '307': 'Temporary Redirect',
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '402': 'Payment Required',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '406': 'Not Acceptable',
    '407': 'Proxy Authentication Required',
    '408': 'Request Time-out',
    '409': 'Conflict',
    '410': 'Gone',
    '411': 'Length Required',
    '412': 'Precondition Failed',
    '413': 'Request Entity Too Large',
    '414': 'Request-URI Too Large',
    '415': 'Unsupported Media Type',
    '416': 'Requested Range Not Satisfiable',
    '417': 'Expectation Failed',
    '418': 'I\'m a teapot',
    '422': 'Unprocessable Entity',
    '423': 'Locked',
    '424': 'Failed Dependency',
    '425': 'Unordered Collection',
    '426': 'Upgrade Required',
    '428': 'Precondition Required',
    '429': 'Too Many Requests',
    '431': 'Request Header Fields Too Large',
    '451': 'Unavailable For Legal Reasons',
    '500': 'Internal Server Error',
    '501': 'Not Implemented',
    '502': 'Bad Gateway',
    '503': 'Service Unavailable',
    '504': 'Gateway Time-out',
    '505': 'HTTP Version Not Supported',
    '506': 'Variant Also Negotiates',
    '507': 'Insufficient Storage',
    '509': 'Bandwidth Limit Exceeded',
    '510': 'Not Extended',
    '511': 'Network Authentication Required'

};








const errorHandler = function (transform) {

  	if (transform) {
    	if (typeof transform != 'function') {
      		throw TypeError ('typeof transform != \'function\'');
   		}  
  	}
  
  	var handle = {};
  	transform = transform || function(o){ return o; };

  	Object.keys(boom).forEach(function(k){

    	handle[k] = function () {
      
	      	var arg = arguments;
	      
	      	if (arg[0] && typeof arg[0].throw == 'function') {
	        
	        	var err = boom[k](arg[1] || '');
	        	var ret = [ err.output.statusCode, transform(arg[1] || codes[err.output.statusCode]) ];
	        	arg[0].throw.apply(arg[0], ret);

	      	}
	      	else {

	        	var err = boom[k](arg[0] || '');
	        	return [ err.output.statusCode, transform(arg[0] || codes[err.output.statusCode]) ];
	      	}
    	};
  
  	});

  	return handle;
};







const middleware = function *(next) {
	this.log.debug('inside Error Hanlder Middleware');

	let sess = this.session;

	utils.debug_log_req(this, sess);

	if (!!this.state.error.status) {
		// remder errpr page only when error exist
		let err = new Error('Page not found');
		err.status = 404;
		
		this.state.error.err = this.state.error.err || err;
		this.log.error('Error: ', this.state.error.err);

		this.state.error.code = this.state.error.code || 404;
		
		this.state.error.message = this.state.error.message || 'The page you are looking for, doesn\'t exist';
		
		let error_info;

		if (!this.state.isAuthenticated) {
			error_info = {
				name: false,
				username: false,
				dp_thumbnail: false,
				status: this.state.error.code,
				message: this.state.error.message
			};
		}
		else {
			error_info = {
				name: sess.info.name,
				username: sess.info.username,
				dp_thumbnail: sess.info.dp_thumbnail,
				status: this.state.error.code,
				message: this.state.error.message
			};
		}
		
		this.log.debug('error_info : ', error_info);

		this.time('render_error_page');
	  	this.set('X-Request-Id', this.reqId);
	  	this.render_marko('error', error_info);	  	
	  	this.timeEnd('render_error_page');
	  	
	  	this.log.debug('error page rendered');
	}

	this.log.debug('Returning from Error Middleware');

  	yield next;

};








function cancel_error_middleware(self) {
  	self.log.debug('adding error status as false so as to skip error middleware');
  	
  	self.state = self.state || {};
  	self.state.error = self.state.error || {};
  	self.state.error.status = false;
}








function activate_error_middleware(self, error_code, error_message) {
	self.log.debug('error statius will remaid true, so that status doesn\'t change and errohandler middleware is triggered');
  	
  	self.state = self.state || {};
  	self.state.error = self.state.error || {};

  	let err;
  	let default_error_message = 'Oops! Something seems to be wrong! Try again later.';

  	if (error_code === 500) {
  		err = new Error('Internal Server Error');
  		err.status = 500;
  	}
  	else if (error_code === 401) {
  		err = new Error('Unauthorized Request');
  		err.status = 500;
  		default_error_message = 'Sorry! You are not authorized to access this resource.';
  	}
  	else if (error_code === 400) {
  		err = new Error('Invalid Request');
  		err.status = 500;
  		default_error_message = 'Yikes! Your request is not of valid sorts.';
  	}
  	else if (error_code === 404) {
  		err = new Error('Page Not Found');
  		err.status = 500;
  		default_error_message = 'Oops! The page you are looking for does not exist.';
  	}
  	else if (error_code === 422) {
  		err = new Error('Unprocessable Request Entity');
  		err.status = 500;
  		default_error_message = 'Yikes! Your request is not of valid sorts.';
  	}

  	error_message = error_message || default_error_message;

  	self.state.error.err = err;
  	self.state.error.code = error_code;
  	self.state.error.message = default_error_message;

}








module.exports.boom = errorHandler();
module.exports.middleware = middleware;
module.exports.activate_error_middleware = activate_error_middleware;
module.exports.cancel_error_middleware = cancel_error_middleware;



