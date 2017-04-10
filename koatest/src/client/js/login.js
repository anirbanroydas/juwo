// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 




    $(document).ready(function() {



    	// event handler for singinbutting click event
    	$('.signinbutton').click(function(event) {
    		event.preventDefault();
            console.log('signinbutton clicked');
            
            let formdata = {
                uname: $('.username-form-group input').val(),
                pwd: $('.password-form-group input').val(),
                remember: $('.checkbox input').val(),
                _csrf: $('.invalid-form-group #csrfInput').val()
            };

            console.log('formdata : ', formdata);

    		// send the form request
    		$.ajax({

    			url: '/login?source=login',
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
    			}
    			
    			
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
            else if (data.status === 400) {
                console.log('data.message: ', data.message);
                // hide the server error
                $('.error-form-group').hide();

                // hide the credential error
                $('.error-helpblock').hide();
                $('.invalid-form-group').removeClass('has-success').removeClass('has-error');

                // add invalid credential format errors
                if ($.inArray('uname', data.message) === -1 ) {
                    console.log('uname not in data.mesage');
                    
                    $('.username-error-feedback').hide();
                    $('.username-success-feedback').show();
                    $('.username-helpblock').hide();
                    $('.username-form-group').removeClass('has-error').removeClass('has-feedback').addClass('has-success').addClass('has-feedback');
                }
                else {
                    console.log('uname in data.mesage');
                    
                    $('.username-error-feedback').show();
                    $('.username-success-feedback').hide();
                    $('.username-helpblock').show();
                    $('.username-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }
                
                if ($.inArray('pwd', data.message) === -1 ) {
                    console.log('pwd not in data.mesage');
                    
                    $('.password-error-feedback').hide();
                    $('.password-success-feedback').show();
                    $('.password-helpblock').hide();
                    $('.password-form-group').removeClass('has-error').removeClass('has-feedback').addClass('has-success').addClass('has-feedback');
                
                }
                else {
                    console.log('pwd in data.mesage');
                    
                    $('.password-error-feedback').show();
                    $('.password-success-feedback').hide();
                    $('.password-helpblock').show();
                    $('.password-form-group').removeClass('has-success').removeClass('has-feedback').addClass('has-error').addClass('has-feedback');
                }

            }
            else if (data.status === 401) {
                console.log('data.message: ', data.message);
                
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
            else if (data.status === 500) {
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





