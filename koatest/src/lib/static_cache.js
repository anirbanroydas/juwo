const serve = require('koa-static-cache');
const path = require('path');

const logger = require('./logger');
const CONFIG = require('./settings').CONFIG_DATA;

const log = logger.log;

// custom options
let options = {
	files : {},
	staticOpts : {
		maxAge: 2592000000,												// cache control max age for the files, 0 by default.
		buffer: true, 													// store the files in memory instead of streaming from the filesystem on each request.
		gzip: true, 													// when request's accept-encoding include gzip, files will compressed by gzip.
		usePrecompiledGzip: false,										// try use gzip files, loaded from disk, like nginx gzip_static
		prefix: '/static'												// the url prefix you wish to add, default to ''.
	},
	bootstrapOpts : {
		maxAge: 2592000000,												// cache control max age for the files, 0 by default.
		buffer: true, 													// store the files in memory instead of streaming from the filesystem on each request.
		gzip: true, 													// when request's accept-encoding include gzip, files will compressed by gzip.
		usePrecompiledGzip: false,										// try use gzip files, loaded from disk, like nginx gzip_static
		prefix: '/bootstrap'											// the url prefix you wish to add, default to ''.
	},
	static_path : path.join(__dirname, '../../', CONFIG.static.path),
	// static_path : CONFIG.static.path,
	boostrap_static_path : path.join(__dirname, '../../../', CONFIG.static.bootstrapDir) 							// ./node_modules/bootstrap/dist
};


log.debug('static path : ', options.static_path);

// create static cache middleware by serving static files
const staticCache_Middleware = serve(options.static_path, options.staticOpts, options.files);


exports.staticCache_Middleware = staticCache_Middleware;
exports.options = options;
exports.serve = serve;