// This is the schema reference file for all the collections in the database
const mongorito = require('mongorito');
const Model = mongorito.Model;




UsersSchema = {

	name: {
		fullname: 'string',
		firstname: 'string',
		middlename: 'string',
		lastname: 'string',
		filteredname: 'string'
	},
	username: 'string',
	email: 'string',
	userid: 'string',
	password_hash: 'string',
	gender: 'string',
	dp_thumbnail: 'string',
	following: {
		count: 'integer'
	},
	followers: {
		count: 'integer'
	},
	bio: 'string'

};







RelationshipsSchema = {

	follower_id: 'string',
	following_id: 'string'

};






ActivitiesSchema = {

	activity_id: 'string',
	source_id: 'string',
	relationship: 'object',
	activity_time: 'datetime',
	type: 'string',
	value: 'string'

};






PostsSchema = {

	post_id: 'string',
	source_id: 'string',
	post_type: 'string', 						// 'Original or Repost(Shared Post with no change) or QuotePost(Shared Post with added content)' 
	shared_post_item_id: 'string', 				// null(in case of Original) or <shared_post_id(post_id or comment_id)>(in case of Repost or QuotePost)
	content: 'string' 							// in case of Orginal Post or QuotePost or null in case of Repost,
	post_time: 'datetime',
	mentions: ['<userid>', '<userid_2>'], 		// null in case of Repost, non-null in case of Original or QuotePost
	hashtags: [ '<tagname>', '<tagname_2>'], 	// null in case of Repost, non-null in case of Original or QuotePost
	likes: {
		count: 'integer' 						// null in case of Repost, non-null in case of Original or QuotePost
	},
	shares: {
		count: 'integer' 						// null in case of Repost, non-null in case of Original or QuotePost
	},
	comments: {
		count: 'integer'						// null in case of Repost, non-null in case of Original or QuotePost
	}

};






PostLikesSchema = {

	// like_id: 'string',
	source_id: 'string',
	// like_type: 'string', // post or comment
	post_id: 'string', 
	like_time: 'datetime'

};




CommentLikesSchema = {

	// like_id: 'string',
	source_id: 'string',
	// like_type: 'string', // post or comment
	comment_id: 'string', // comment_id
	like_time: 'datetime'

};





SocialSharesSchema = {

	// share_id: 'string',
	source_id: 'string',
	social_platform: 'string',
	share_type: 'string',
	share_item_id: 'string',
	share_time: 'datetime'

};





CommentsSchema = {

	comment_id: 'string',
	source_id: 'string',
	comment_type: 'string', // post_comment or comment_reply
	comment_item_id: 'string',  // post_id or comment_id
	content: 'string',
	comment_time: 'datetime',
	mentions: ['<userid>', '<userid_2>'], 		
	hashtags: [ '<tagname>', '<tagname_2>'], 	
	likes: {
		count: 'integer' 						
	},
	shares: {
		count: 'integer' 						
	},
	replies: {
		count: 'integer'						
	}

};






HashtagsSchema = {

	hashtag_id: 'string',
	content: 'string',
	content_type: 'string',
	content_item_id: 'string'

};







class Schema {

	static Users() {
		return UsersSchema;
	}



	static Relationships() {
		return RelationshipsSchema;
	}


	static Activities() {
		return ActivitiesSchema;
	}


	static Posts() {
		return PostsSchema;
	}


	static Likes() {
		return LikesSchema;
	}


	static Shares() {
		return SharesSchema;
	}


	static Comments() {
		return CommentsSchema;
	}


	static Hashtags() {
		return HashtagsSchema;
	}


	static get Models() {
		// Sample collection in the database
		let models = {

			Base: class extends Model {

			},

			Users: class extends Model {

			},

			Relationships: class extends Model {

			},

			Activities: class extends Model {

			},

			Posts: class extends Model {

			},

			Likes: class extends Model {

			},

			Shares: class extends Model {

			},

			Comments: class extends Model {

			},

			Hashtags: class extends Model {

			}

		};

		return models;

	}



	static get Collections() {
		return Schema.Models;
	}

}







module.exports = Schema;


