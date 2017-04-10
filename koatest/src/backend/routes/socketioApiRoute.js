const FeedApiHandler = require('../views/socketio_FeedApiView');
const TimelineApiHandler = require('../views/socketio_TimelineApiView');
const NotificationApiHandler = require('../views/socketio_NotificationApiView');
const LivestreamApiHandler = require('../views/socketio_LivestreamApiView');
const logger = require('../../lib/logger');


const log = logger.log;





class API {

	static feed(io) {
		let handler = new FeedApiHandler();
		let nsp = io.of('/feed');
		
		handler.init(nsp);
	}


	static timeline(io) {
		let handler = new TimelineApiHandler();
		let nsp = io.of('/timeline');
		
		handler.init(nsp);
	}


	static notification(io) {
		let handler = new NotificationApiHandler();
		let nsp = io.of('/notification');
		
		handler.init(nsp);
	}


	static livestream(io) {
		let handler = new LivestreamApiHandler();
		let nsp = io.of('/livestream');
		
		handler.init(nsp);
	}
	

}





module.exports = API;


