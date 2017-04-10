


// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 
  
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
            let w = $(window).width();
            let h = $(window).height();
            let mt = $('.navbar-fixed-top').height();
            console.log('w : ' + w + ' h : ' + h + ' mt : ' + mt);
            let styles, styles2, cw, ch, ch2;

            if (w < 767){
                cw = w;
                styles = {
                    "width": "100%",
                    "height": h - mt - 70 + "px",
                    "margin-top": mt + "px",
                };

            }
            else {
                cw = 0.3*w;
                ch = (2*h)/3;
                ch2 = ch + 53;
                styles = {
                    "width": cw + "px",
                    "height": ch + "px",
                    "margin-top": mt + 25 + "px"
                };
                styles2 = {
                    "width": cw + "px",
                    "height": ch2 + "px",
                    "margin-top": mt + 25 + "px"
                };

                $('.chatbox-2').css(styles2);
                $('.chatbox-content').css({"height": ch - 60 - 4 + "px"});
                $('.chatbox-userlist').css({"height": ch2 - 60 + "px"});
            }
            
            $('.chatbox').css(styles); 
            
            $('.chatbox-row .chatbox-col .form-inline').css({"width": cw + "px"});
            $('.chatbox-row .chatbox-col .form-inline .form-control').css({"width": cw - 70 - 7 - 4 + "px"});


        })
        .resize();      // to call resize on page load too

    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
