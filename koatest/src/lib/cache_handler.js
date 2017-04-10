const mixwith = require('mixwith');

const UserCacheMixin = require('./mixin_UserCache');
const ActivityCacheMixin = require('./mixin_ActivityCache');
const PostsCacheMixin = require('./mixin_PostsCache');
const FeedCacheMixin = require('./mixin_FeedCache');
const RelationshipsMixin = require('./mixin_RelationshipsCache');
const logger = require('./logger');




const log = logger.log;
const mix = mixwith.mix;





class BaseDummySuperClass {
	// A dummy super class so that it can be used to mix with other mixins
}




class Cache extends  mix(BaseDummySuperClass).with(UserCacheMixin, ActivityCacheMixin, PostsCacheMixin, FeedCacheMixin, RelationshipsMixin) {
	

}
	





module.exports = Cache;


