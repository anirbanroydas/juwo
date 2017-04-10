const marko =  require('marko');
const path = require('path');



// marko_template(srcDir, options) {function} : rerturn a generator which works as a middlware whhich is applied to the koa app
// 
// Params-
// @srcDir : {string} source dirctory of marko templates Default : current workiding dirctory : __dirname or process.cwd()
// @options: {object}
// 		options.srcPath : {sring} same as srcDir, but takes precedence over srcDir, Default is null
// 		options.ext : {string} extension of marco templates,  Default .marco
// 		options.write_to_disk : {boolean} whether to write templates to disk after rendering, Default is false
	
function marko_template(srcDir, options) {
	let Opts;
	
	if (typeof srcDir === 'object') {		
		options = srcDir;
		srcDir = undefined;		
	}
	
	Opts = options || {};
	let srcPath = Opts.srcPath || srcDir || __dirname || process.cwd();
	let ext = Opts.ext || 'marco';
	let write_to_disk = typeof Opts.writeToDisk === 'boolean' ? Opts.writeToDisk : false;

	return function *(next) {
		if (this.render_marko) {
			yield next;
		}

		this.render_marko = function (name, opts) {
			let templatePath = path.join(srcPath, name + '.' + ext);
			let template = marko.load(templatePath, {writeToDisk: write_to_disk});

			this.type = 'text/html; charset=utf-8';
			this.body = template.stream(opts);
		};

		yield next;
	};
}




module.exports = marko_template;