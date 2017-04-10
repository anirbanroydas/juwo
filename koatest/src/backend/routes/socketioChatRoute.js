const PublicChatHandler = require('./socketio_ChatPublicView');
const IrcChatHandler = require('./socketio_ChatIrcView');
const PrivateChatHandler = require('./socketio_ChatPrivateView');
const logger = require('../../lib/logger');



const log = logger.log;





class API {

	static public(io) {
		let handler = new PublicChatHandler();
		let nsp = io.of('/chat_public');
		
		handler.init(nsp);
	}


	static irc(io) {
		let handler = new IrcChatHandler();
		let nsp = io.of('/chat_irc');
		
		handler.init(nsp);
	}


	static private(io) {
		let handler = new PrivateChatHandler();
		let nsp = io.of('/chat_private');
		
		handler.init(nsp);
	}
	

}





module.exports = API;



