const views = require('koa-views'); 
const path = require('path');

const CONFIG = require('./settings').CONFIG_DATA;

// custom options
let options = {
	view_template_path : path.join(__dirname, '../../', CONFIG.templates.html.srcDir),
	viewOpts : {
		// map: {
	  	//   html: 'handlebars'
	  	// }, 
	  	extension: CONFIG.templates.html.extension
	}
};


// Middleware for rendering templates
const render_Middleware = views(options.view_template_path, options.viewOpts);


exports.render_Middleware = render_Middleware;
exports.options = options;
