const sodium = require("sodium");
const URLSafeBase64 = require('urlsafe-base64');
const object_sizeof = require('object-sizeof');
const _ = require('lodash');



class Utils {

    static genid(n) {
        let buff = new Buffer(n);
        sodium.api.randombytes_buf(buff, n);
        let urlsafe_base64string = URLSafeBase64.encode(buff);
        return urlsafe_base64string;
    }




    static sizeof(obj) {
        return object_sizeof(obj);
    }





    static debug_log_req(self, session) {
        
        self.log.debug('koa request : ', self.request); 
        self.log.debug('\n\n body : ', self.body); 
        self.log.debug('\n\n querystring : ', self.querystring); 
        self.log.debug('\n\n query : ', self.query); 
        self.log.debug('\n\n state : ', self.state);
        self.log.debug('\n\n session : ', session);
    }




    static debug_csrf(self, csrf) {
        
        self.log.debug('[IndexGetHandler] csrf : ', csrf);
        self.log.debug('[IndexGetHandler] this._csrf : ', self._csrf);
    }





    static debug_sess(self, session) {

        self.log.debug('[IndexGetHandler] session value : ', session);
        self.log.debug('[IndexGetHandler] session value : ', self.session);
    }




    // Returns a backoff time for retrying a function
    static backoff(retries) {
        return Math.pow(((Math.random()*(4-2)) + 2), retries);
    }





    static trim_form_inputs(inputs) {
        for (let key in inputs) {
            
            let value = inputs[key];
            if (typeof value === 'string') {
                inputs[key] = inputs[key].trim();
            }
        }
    }




}


module.exports = Utils;
