const path = require('path');

const marko_template = require('./marko_template');
const CONFIG = require('./settings').CONFIG_DATA;


let options = {
	srcPath: path.join(__dirname, '../../', CONFIG.templates.marko.srcDir),
	ext: 'marko',
	write_to_disk: false
};


const marko_middleware = marko_template(options);

exports.middleware = marko_middleware;