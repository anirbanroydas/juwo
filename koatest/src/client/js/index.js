// const jQuery = require('jquery');
// const bootstrap = require('bootstrap');


// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 





    $(document).ready(function() {
    	


    	// event handler for singinbutting click event
    	$('.signinbutton').click(function(event) {
    		event.preventDefault();

    		let formdata = {
				uname: $('.username-form-group input').val(),
				pwd: $('.password-form-group input').val(),
				_csrf: $('#csrfInput').val()
			};

    		// send the form request
    		$.ajax({

    			url: '/login?source=index',
    			async: true,
                timeout: 60000,
    			method: 'POST',
    			dataType: 'json',
                data: JSON.stringify(formdata),
                contentType: "application/json",
                processData: false,
    			
    			error: function(jqXHR, textStatus, error) {
                    console.log('ajax error function triggered');
                    console.log('status : ', textStatus);
    				processLoginError();
    			},
    			
    			success: function(data, textStatus, jqXHR) {
                    console.log('ajax success function triggered');
                    console.log('status : ', textStatus);
    				processLoginSuccess(data);
    			},
    			
    			
    		});

    	}); 







    	// function to handle the data received in case of success of login request but with error
    	function processLoginSuccess(data) {

            if (typeof data !=== 'object') {
                data = JSON.parse(data);
            }
    		console.log('data received : ', data);

    		if (data.status === 302) {

                window.location.href = data.message;
            }
            else if (data.status === 401) {

                let redirect = '/login?error=true&server=false&uname_error=false&pwd_error=false';
                console.log('redirecting to : ', redirect);
                
                window.location.href = redirect;
                
            } 
            else if (data.status === 500) {

                let redirect = '/login?error=false&server=true&uname_error=false&pwd_error=false';
                console.log('redirecting to : ', redirect);
                
                window.location.href = redirect;
                
            } 
            else if (data.status === 200) {
                
                window.location.href = data.message;         
            } 
    	}   






        // function to handle the data received in case of error in the post request
        function processLoginError() {
            // redirect user to error page somehow
            let redirect = '/error?server=true';
            console.log('redirecting to : ', redirect);
            
            window.location.href = redirect;
        }




    });



}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter




