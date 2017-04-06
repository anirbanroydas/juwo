let mixwith = require('mixwith');

const logger = require('../koatest/src/lib/logger');
const PostsCacheMixin = require('./test_mixwith');

const log = logger.log;

const mix = mixwith.mix;


class  BaseSuperclass {  


	// static three() {
	// 	log.info('BAse: BaseSuperclass, methiod : three');
	// }
	

}



class  Cache extends mix(BaseSuperclass).with(PostsCacheMixin) {  


}



Cache.one();
Cache.two();
// Cache.three();
// Cache.four();