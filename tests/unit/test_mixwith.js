const mixwith = require('mixwith');

const logger = require('../koatest/src/lib/logger');

const log = logger.log;


const PostsCacheBaseMixin = (superclass) => class extends superclass {  


	static one() {
		log.info('BAse: PostsCacheMixin, methiod : one');
	}
	


	static two() {
		log.info('BAse: PostsCacheMixin, methiod : two');
	}


};




const PostsCacheMixin = mixwith.Mixin(PostsCacheBaseMixin);


// module.exports = PostsCacheMixin;
module.exports = PostsCacheBaseMixin;