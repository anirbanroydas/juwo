// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 




    $(document).ready(function() {



    	// event handler for singinbutting click event
    	$('.signupbutton').click(function(event) {
    		event.preventDefault();

            let formdata = {
                uname: $('.username-form-group input').val(),
                pwd: $('.password-form-group input').val(),
                name: $('.name-form-group input').val(),
                email: $('.email-form-group input').val(),
                gender: $(".gender-group input[name='gender']:checked").val(),
                tos: $(".checkbox input[name='tos']:checked").val(),
                _csrf: $('.invalid-form-group #csrfInput').val()
            };
    		
            console.log('formdata : ', formdata);

            // send the form request
    		$.ajax({

    			url: '/signup',
    			async: true,
                timeout: 60000,
                method: 'POST',
                dataType: 'json',
                data: JSON.stringify(formdata),
                contentType: "application/json",
                processData: false,

    			error: function(jqXHR, textStatus, error) {
    				processSignupError();
    			},
    			
    			success: function(data, textStatus, jqXHR) {
    				processSignupSuccess(data);
    			}
    			
    			
    		});

    	}); 






    	// function to handle the data received in case of success of login request but with error
    	function processSignupSuccess(data) {
    		
            if (typeof data !=== 'object') {
                data = JSON.parse(data);
            }
            console.log('data received : ', data);

            if (data.status === 302) {
                
                window.location.href = data.message;
            
            }
            else if (data.status === 400) {
                // hide the server error
                $('.error-form-group').hide();

                // hide the credential error
                $('.error-helpblock').hide();
                $('.invalid-form-group').removeClass('has-success').removeClass('has-error');

                // add invalid credential format errors
                if ($.inArray('name', data.message) === -1 ) {
                    $('.name-error-feedback').hide();
                    $('.name-success-feedback').show();
                    $('.name-helpblock').hide();
                    $('.name-form-group').removeClass('has-error').removeClass('has-feedback').addClass('has-success').addClass('has-feedback');
                }
                else {
                    $('.name-error-feedback').show();
                    $('.name-success-feedback').hide();
                    $('.name-helpblock').show();
                    $('.name-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }


                if ($.inArray('uname', data.message) === -1 && $.inArray('unameexists', data.message) === -1) {
                    $('.username-error-feedback').hide();
                    $('.username-success-feedback').show();
                    $('.username-helpblock').hide();
                    $('.username-helpblock-2').hide();
                    $('.username-form-group').removeClass('has-error').removeClass('has-feedback').addClass('has-success').addClass('has-feedback');
                }
                else if ($.inArray('uname', data.message) !== -1) {
                    $('.username-error-feedback').show();
                    $('.username-success-feedback').hide();
                    $('.username-helpblock').show();
                    $('.username-helpblock-2').hide();
                    $('.username-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }
                else {
                    $('.username-error-feedback').show();
                    $('.username-success-feedback').hide();
                    $('.username-helpblock').hide();
                    $('.username-helpblock-2').show();
                    $('.username-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }
                


                if ($.inArray('email', data.message) === -1 && $.inArray('emailexists', data.message) === -1 ) {
                    $('.email-error-feedback').hide();
                    $('.email-success-feedback').show();
                    $('.email-helpblock').hide();
                    $('.email-helpblock-2').hide();
                    $('.email-form-group').removeClass('has-error').removeClass('has-feedback').addClass('has-success').addClass('has-feedback');
                }
                else if ($.inArray('email', data.message) !== -1) {
                    $('.email-error-feedback').show();
                    $('.email-success-feedback').hide();
                    $('.email-helpblock').show();
                    $('.email-helpblock-2').hide();
                    $('.email-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }
                else {
                    $('.email-error-feedback').show();
                    $('.email-success-feedback').hide();
                    $('.email-helpblock').hide();
                    $('.email-helpblock-2').show();
                    $('.email-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
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


                if ($.inArray('gender', data.message) === -1 ) {
                    $('.gender-helpblock').hide();
                }
                else {
                    $('.gender-helpblock').show();
                }

                if ($.inArray('tos', data.message) === -1 ) {
                    $('.tos-helpblock').hide();
                }
                else {
                    $('.tos-helpblock').show();
                }

            }
            else if (data.status === 401) {
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
                $('.username-helpblock-2').hide();
                $('.username-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');
                
                $('.name-error-feedback').hide();
                $('.name-success-feedback').hide();
                $('.name-helpblock').hide();
                $('.name-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');

                $('.email-error-feedback').hide();
                $('.email-success-feedback').hide();
                $('.email-helpblock').hide();
                $('.email-helpblock-2').hide();
                $('.email-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');

                // show the credential error
                $('.error-helpblock').show();
                $('.invalid-form-group').removeClass('has-success').addClass('has-error');
            
            }
            else if (data.status === 500) {
                // hide the format errors
                $('.password-error-feedback').hide();
                $('.password-success-feedback').hide();
                $('.password-helpblock').hide();
                $('.password-form-group').removeClass('has-error').removeClass('has-success').removeClass('has-feedback');
                
                $('.username-error-feedback').hide();
                $('.username-success-feedback').hide();
                $('.username-helpblock').hide();
                $('.username-helpblock-2').hide();
                $('.username-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');
                
                $('.name-error-feedback').hide();
                $('.name-success-feedback').hide();
                $('.name-helpblock').hide();
                $('.name-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');

                $('.email-error-feedback').hide();
                $('.email-success-feedback').hide();
                $('.email-helpblock').hide();
                $('.email-helpblock-2').hide();
                $('.email-form-group').removeClass('has-success').removeClass('has-error').removeClass('has-feedback');

                // hide the credential error
                $('.error-helpblock').hide();
                $('.invalid-form-group').removeClass('has-success').removeClass('has-error');

                // show the server error
                $('.error-form-group').show();
                
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






