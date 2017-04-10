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
        


        let t1 = Date.now();

        $(window).load(function() {
            let diff = Date.now() - t1;

            if (diff < 2000) {
                setTimeout(function() {
                    $('.menu-bar').css({"visibility": "visible"});
                    $('.body-container-before-loading').hide();
                    $('.main-page-content-wrapper').show();

                }, 2000 - diff);
            }
            else {
                $('.menu-bar').css({"visibility": "visible"});
                $('.body-container-before-loading').hide();
                $('.main-page-content-wrapper').show();
            }
        });


        


        let $chatBtn = $('.lead3 button');
        console.log('chat btn : ', $chatBtn);
        
        // event handler for chat button click event
        $chatBtn.click(function(event) {
            event.preventDefault();

            console.log('this : ', $(this));

            let data = {
                chat: $(this).text()
            };

            console.log('data : ', data);

            // send the form request
            $.ajax({

                url: '/chat',
                async: true,
                timeout: 60000,
                method: 'POST',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: "application/json",
                processData: false,
                
                // error: function(jqXHR, textStatus, error) {
                //     processChatError();
                // },
                
                success: function(data, textStatus, jqXHR) {
                    processChatSuccess(data);
                },
                
                
            });

        }); 


        // function to handle the data received in case of success of login request but with error
        function processChatSuccess(data) {
            console.log('data received : ', data);

            if (data.status === 301) {
                console.log('data.status: ', data.status);
                console.log('redirecting to : ', data.message);
                
                window.location.href = data.message;
            }
            else { 
                console.log('refreshing page');
                
                window.location.href = data.message;  
            } 
        } 




        


    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
