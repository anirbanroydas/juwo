// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 

    let welcomeLoader = true;
  
    $(document).ready(function() {

    	function divAbsoluteResizer(el) {
    		let w = $(el).width();
	    	let h = $(el).height();
	    	let styles = {};
	   		styles['margin-left'] =  '-' + w/2 + 'px';
	 		styles['margin-top'] =  '-' + h/2 + 'px';
	 		$(el).css(styles);
    	}	



        $(window).resize(function(){
            console.log('resize called');

            if (welcomeLoader) {
                // Call div REsizer everytime when window changes but only when welcome loader is enabled
                divAbsoluteResizer('.body-container-before-loading');
            }
            

        });
        
        


    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
