// const jQuery = require('jquery');
// const bootstrap = require('bootstrap');


// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 


    $(document).ready(function() {
    	
        $('.ajax-error-helpblock').hide();

    	// event handler for singinbutting click event
    	$('.signinbutton').click(function(event) {
    		event.preventDefault();

    		// send the form request
    		$.ajax({

    			url: '/login?source=login',
    			async: true,
    			method: 'POST',
    			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    			dataType: 'json',
    			timeout: 60000,
    			
    			error: function(jqXHR, textStatus, error) {
    				processLoginError();
    			},
    			
    			success: function(data, textStatus, jqXHR) {
    				processLoginSuccess(data);
    			}
    			
    			
    		});

    	}); 


    	// function to handle the data received in case of success of login request but with error
    	function processLoginSuccess(data) {
    		console.log('data received : ', data);

            if (data.status === '400') {
                // hide the server error
                $('.error-form-group').hide();

                // hide the credential error
                $('.error-helpblock').hide();
                $('.invalid-form-group').removeClass('has-success').removeClass('has-error');

                // add invalid credential format errors
                if ($.inArray('uname', data.message) === -1 ) {
                    $('.username-error-feedback').hide();
                    $('.username-success-feedback').show();
                    $('.username-helpblock').hide();
                    $('.username-form-group').removeClass('has-error').removeClass('has-feedback').addClass('has-success').addClass('has-feedback');
                }
                else {
                    $('.username-error-feedback').show();
                    $('.username-success-feedback').hide();
                    $('.username-helpblock').show();
                    $('.username-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }
                
                if ($.inArray('pwd', data.message) === -1 ) {
                    $('.password-error-feedback').hide();
                    $('.password-success-feedback').show();
                    $('.password-helpblock').hide();
                    $('.password-form-group').removeClass('has-error').removeClass('has-feedback').addClass('has-success').addClass('has-feedback');
                }
                else {
                    $('.password-error-feedback').show();
                    $('.password-success-feedback').hide();
                    $('.password-helpblock').show();
                    $('.password-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }

            }
            else if (data.status === '401') {
                // hide the server error
                $('.error-form-group').hide();

                // hide the format errors
                $('.password-error-feedback').hide();
                $('.password-success-feedback').hide();
                $('.password-helpblock').hide();
                $('.password-form-group').removeClass('has-error').removeClass('has-success').removeClass('has-feedback');
                $('.username-error-feedback').hide();
                $('.username-success-feedback').hide();
                $('.username-helpblock').hide();
                $('.username-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');

                // show the credential error
                $('.error-helpblock').show();
                $('.invalid-form-group').removeClass('has-success').addClass('has-error');
            }
    	} 




        function processLoginError() {
            // hide the format errors
            $('.password-error-feedback').hide();
            $('.password-success-feedback').hide();
            $('.password-helpblock').hide();
            $('.password-form-group').removeClass('has-error').removeClass('has-success').removeClass('has-feedback');
            $('.username-error-feedback').hide();
            $('.username-success-feedback').hide();
            $('.username-helpblock').hide();
            $('.username-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');

            // hide the credential error
            $('.error-helpblock').hide();
            $('.invalid-form-group').removeClass('has-success').removeClass('has-error');

            // show the server error
            $('.error-form-group').show();
        }




    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
