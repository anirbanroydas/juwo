const bunyan = require('bunyan');
const koaBunyanLogger = require('koa-bunyan-logger');

// create the logger instance
let log = bunyan.createLogger({
    name: 'koatest',                     			// Required
    streams: [										// Optional, see "Streams" section
	    {
	    	level: 'debug',
	      	stream: process.stdout            		// log INFO and above to stdout
	    },
	    {
	      	level: 'info',
	      	path: '/var/tmp/koatest/koatest.log',  			// log ERROR and above to a file
	        type: 'rotating-file',                  // logrotate
	        period: '1d',   						// daily rotation
        	count: 5        						// keep 5 back copies                                                 			
	    }
  	]   
    // serializers: <serializers mapping>, 			// Optional, see "Serializers" section
    
});


// custom options
let options = {
	main_logger : log,
	request_logger_options : {

	},
	timeContext_logger_options : {
		logLevel : 'info',
		updateLogFields : function (fields) {
    		return {
		      	request_trace : {
		        	label: fields.label,
		        	duration: fields.duration
		      	}
    		};
  		}
	},
	requestIdContext_logger_options : {
		header: 'X-Request-Id', 				// name of header to get request id from, default - X-Request-Id
		prop: 'reqId', 							// property to store on context; defaults to 'reqId' e.g. this.reqId
		requestProp: 'reqId', 					// property to store on request; defaults to 'reqId' e.g. this.request.reqId
		field: 'req_id'							// field to add to log messages in downstream middleware and handlers; defaults to 'req_id'
	}
};


// Add logger Middleware for koa
const logger_Middleware = koaBunyanLogger(options.main_logger);

// Add bunyan custom koa bunyan logger Middlewares
const koaBunyan_requestLogger_Middleware = koaBunyanLogger.requestLogger(options.request_logger_options);
const koaBunyan_requestIdContext_Middleware = koaBunyanLogger.requestIdContext(options.requestIdContext_logger_options);
const koaBunyan_timeContext_Middleware = koaBunyanLogger.timeContext(options.timeContext_logger_options);


// export the global bunyan logger that can be used anywhere, IT is INDEPENEDENT of every other module
exports.log = log;
// export koa bunyan logger middleware used within koa app
exports.logger_Middleware = logger_Middleware;
exports.koaBunyan_requestLogger_Middleware = koaBunyan_requestLogger_Middleware;
exports.koaBunyan_requestIdContext_Middleware = koaBunyan_requestIdContext_Middleware;
exports.koaBunyan_timeContext_Middleware = koaBunyan_timeContext_Middleware;


