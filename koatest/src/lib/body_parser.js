const qs = require('qs'); 
const bodyparser = require('koa-better-body'); 
const path = require('path');

const CONFIG = require('./settings').CONFIG_DATA;

// custom options
let options = {
	bodyparserOpts : {
		fields: 'body',									// {Boolean|String}: Default false, which means it will set fields on this.request.fields. 
		             									// If you pass a string, for example 'foo', you will have fields on this.request.foo
		files: false, 									// {Boolean|String}: Default false, which means it will set files on this.request.files.
		              									// If you pass a string, for example 'bar', you will have files on this.request.bar.
		multipart: true,								// {Boolean}: Default true. If you pass false it won't accept/parse multipart bodies.
		textLimit: '100kb', 							// {String}: Default '100kb'. Passed to bytes.parse method.
		formLimit: '100kb', 							// {String}: Default '100kb'. Passed to bytes.parse method.
		urlencodedLimit: '100kb', 						// {String}: Default '100kb'. Alias of opts.formLimit.
		jsonLimit: '100kb', 							// {String}: Default '100kb'. Passed to bytes.parse method.
		bufferLimit: '1mb', 							// {String}: Default '1mb'. Passed to bytes.parse method.
		jsonStrict: true, 								// {Boolean}: Default true. When set to true, JSON parser will only accept arrays and objects.
		detectJSON: undefined, 							// {Function}: Custom JSON request detect function - detectJSON(ctx).
		strict: false, 									// {Boolean}: Default true. Pass false if you want to allow parsing GET, DELETE and HEAD requests.
		onerror: bodyParserErrorHandler, 				// {Function}: Custom error handle, if throw an error, you can customize the response - onerror(err, ctx)
		extendTypes: undefined, 						// {Object}: Default accepting types can find on utils.defaultTypes function. 
		                        						// Allowing you to extend what your app can accept. By default works for JSON, 
		                        						// JSON API v1, multipart, text, urlencoded and csp-report.
		querystring: qs, 								// Querystring module to be used. qs or node js's querystiring 
		delimiter: '&', 								// {String}: Default is &. Delimiter of key/value pairs, passed to querystring lib
		buffer: false 									// {Boolean}: Default false, pass true if you want to get body as buffer.
	}
};




function bodyParserErrorHandler(err, ctx) {
	
	err.name = err.name || '';
	err.name = err.name + ' koa-body-parser-error';
	ctx.log.error(err);
	
	ctx.state = ctx.state || {};
	ctx.state.error = ctx.state.error || {};
	ctx.state.error.bodyparser = CONFIG.codes.error.BODY_PARSER_ERROR;

	ctx.throw('bodyparser-error', 422);
	
}



// Middleware for rendering templates
const bodyparser_Middleware = bodyparser(options.bodyparserOpts);


exports.bodyparser_Middleware = bodyparser_Middleware;
exports.options = options;
