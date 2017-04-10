// const jQuery = require('jquery');
// const bootstrap = require('bootstrap');

// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 
    const io = require('socket.io-client');


    $(document).ready(function() {
    	
        console.log('document ready');



        // event handler for singinbutting click event
        $('.signinbutton').click(function(event) {
            event.preventDefault();

            console.log('singinbuttong cliecked');
            
            console.log('trying to connect to socket');
        
            // let socket = io.connect('/');
            // console.log('io.connect(/)');
            
           
            // let Pub, Priv;

            // socket.on('connect', function(){
            //     console.log('[client] [Io] socket connected');

            //     console.log('[Io] Emiting authentication event');
            //     socket.emit('authentication', {userid: "testuser", token: "testtoken"});
                
            //     socket.on('authenticated', function() {
            //         console.log('socket [Io] authenticated event triggered');

                    
                    
            //         socket.on('hi', function(data) {
            //             console.log('[Io] hi event triggered');
            //             console.log('[Io] data : ', data);

            //             console.log('[Io] emitting hello event');
            //             socket.emit('hello', {msg: '[client] hello from Io'});

            //         });

                    
                    

            //     });
                
            
            // }); 


            // socket.on('disconnect', function() {
            //     console.log('[Io] disconnect event triggered');

            // });


            let Pub = io.connect('/Pub');
            console.log('io.connect(/Pub)');
    
            let Priv = io.connect('/Priv');
            console.log('io.connect(/Priv)');

            Pub.on('connect', function() {
                console.log('[client] [Pub] socket connected');

                console.log('[client] [Pub] Emiting authentication event');
                Pub.emit('authentication', {userid: "testuser", token: "testtoken"});
                
                // console.log('[client]  [Pub] emitting hello-Pub event');
                // Pub.emit('hello-Pub', {msg: '[client] hello from Pub'});

                Pub.on('authenticated', function() {

                    Pub.on('hi-Pub', function(data) {
                        console.log('[client]  [Pub] hi-Pub event triggered');
                        console.log('[client]  [Pub] data : ', data);

                        console.log('[client]  [Pub] emitting hello-Pub event');
                        Pub.emit('hello-Pub', {msg: '[client] hello from Pub'});

                        console.log('[client]  [Pub] emitting namaste-Pub event');
                        Pub.emit('namaste-Pub', {msg: '[client] namaste from Pub'});

                    });
                
                });

                

            
            }); 

            Pub.on('disconnect', function() {
                console.log('[Pub] disconnect event triggered');

            }); 



            Priv.on('connect', function(){
                console.log('socket [Priv] connected');

                console.log('[client]  [Priv] Emiting authentication event');
                Priv.emit('authentication', {userid: "testuser", token: "testtoken"});
                
                
                Pub.on('authenticated', function() {


                    Priv.on('hi-Priv', function(data) {
                        console.log('[client]  [Priv] hi-Priv event triggered');
                        console.log('[client]  [Priv] data : ', data);

                        console.log('[Priv] emitting hello-Priv event');
                        Priv.emit('hello-Priv', {msg: '[client] hello from Priv'});

                        console.log('[Priv] emitting namaste-Priv event');
                        Priv.emit('namaste-Priv', {msg: '[client] namaste from Priv'});
                    });

                });
            
            }); 


            Priv.on('disconnect', function() {
                console.log('[Priv] disconnect event triggered');

            });  








            $('.signupbtn').click(function(event) {
                event.preventDefault();

                // console.log('Disconnecting Io socket');
                // socket.disconnect();

                // console.log('[Priv] emitting disconnect_nsp event');
                // Priv.emit('disconnect_nsp', {nsp: '/Priv'});

                // console.log('[client]  [Pub] emitting hello-Pub event');
                // Pub.emit('hello-Pub', {msg: '[client] hello from Pub'});

                // console.log('[Priv] emitting hello-Priv event');
                // Priv.emit('hello-Priv', {msg: '[client] hello from Priv'});


                // console.log('[client]  [Pub] emitting namaste-Pub event');
                // Pub.emit('namaste-Pub', {msg: '[client] namaste from Pub'});

                // console.log('[Priv] emitting namaste-Priv event');
                // Priv.emit('namaste-Priv', {msg: '[client] namaste from Priv'});
                
                console.log('[Priv] emitting disconnect event');
                Priv.disconnect();

                console.log('[client]  [Pub] emitting hello-Pub event');
                Pub.emit('hello-Pub', {msg: '[client] hello from Pub'});

                console.log('[Priv] emitting hello-Priv event');
                Priv.emit('hello-Priv', {msg: '[client] hello from Priv'});


                console.log('[client]  [Pub] emitting namaste-Pub event');
                Pub.emit('namaste-Pub', {msg: '[client] namaste from Pub'});

                console.log('[Priv] emitting namaste-Priv event');
                Priv.emit('namaste-Priv', {msg: '[client] namaste from Priv'});

            });
             



        }); 





        


    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
