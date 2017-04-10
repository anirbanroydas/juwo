// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 
    
  
    $(document).ready(function() {

        // navbar menu button events
        let trending_isOpen = false;
        let cocktail_isOpen = false;
        let coffee_cup_isOpen = false;
        let coffee_starbucks_isOpen = false;
        let notification_isOpen = false;
        let profile_isOpen = false;
        let about_isOpen = false;

        console.log('manubar variable : ', trending_isOpen);

        $('html').click(function(event) {
            console.log('html clicked event ');
            toggle_open_menus_except('none');
        });



        $('.menu-btn').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
         

            if ($(this).hasClass('home-btn')) {
                window.location.href = '/';
            }

            if ($(this).hasClass('trending-btn')) {
                // first toggle any open menus first
                toggle_open_menus_except('trending-btn');

                $(this).parent().toggleClass('open');

                $(this).find('.menu-icon-img').toggle();
                $(this).find('i').toggle();

                trending_isOpen = !trending_isOpen;
            }

            if ($(this).hasClass('cocktail-btn')) {
                // first toggle any open menus first
                toggle_open_menus_except('cocktail-btn');

                $(this).parent().toggleClass('open');

                $(this).find('.menu-icon-img').toggle();
                $(this).find('i').toggle();

                cocktail_isOpen = !cocktail_isOpen;
            }

            if ($(this).hasClass('coffee-cup-btn')) {
                // first toggle any open menus first
                toggle_open_menus_except('coffee-cup-btn');

                $(this).find('.menu-icon-img').toggle();
                $(this).find('i').toggle();

                coffee_cup_isOpen = !coffee_cup_isOpen;
            }

            if ($(this).hasClass('coffee-starbucks-btn')) {
                // first toggle any open menus first
                toggle_open_menus_except('coffee-starbucks-btn');

                $(this).find('.menu-icon-img').toggle();
                $(this).find('i').toggle();

                coffee_starbucks_isOpen = !coffee_starbucks_isOpen;
            }

            if ($(this).hasClass('notification-btn')) {
                // first toggle any open menus first
                toggle_open_menus_except('notification-btn');

                $(this).parent().toggleClass('open');

                $(this).find('.menu-icon-img').toggle();
                $(this).find('i').toggle();

                notification_isOpen = !notification_isOpen;

            }

            if ($(this).hasClass('profile-btn')) {
                // first toggle any open menus first
                toggle_open_menus_except('profile-btn');
                
                $(this).parent().toggleClass('open');

                $(this).find('.menu-icon-img').toggle();
                $(this).find('i').toggle();

                profile_isOpen = !profile_isOpen;
            }

            if ($(this).hasClass('about-btn')) {
                // first toggle any open menus first
                toggle_open_menus_except('about-btn');
                
                $(this).parent().toggleClass('open');

                $(this).find('.menu-icon-img').toggle();
                $(this).find('i').toggle();

                about_isOpen = !about_isOpen;
            }


        });




        function toggle_open_menus_except(except) {
            
            
            // try to close the trending menu
            if (except !== 'trending-btn' && trending_isOpen) {
                // now close the menu
                trending_isOpen = false;

                // also toggle the notification icons
                $('.trending-btn').find('.menu-icon-img').toggle();
                $('.trending-btn').find('i').toggle();

                $('.trending-btn').parent().toggleClass('open');
            }

            // try to close the trending menu
            if (except !== 'cocktail-btn' && cocktail_isOpen) {
                // now close the menu
                cocktail_isOpen = false;

                // also toggle the notification icons
                $('.cocktail-btn').find('.menu-icon-img').toggle();
                $('.cocktail-btn').find('i').toggle();

                $('.cocktail-btn').parent().toggleClass('open');
            } 

            // try to close the trending menu
            if (except !== 'coffee-cup-btn' && coffee_cup_isOpen) {
                // now close the menu
                coffee_cup_isOpen = false;

                // also toggle the notification icons
                $('.coffee-cup-btn').find('.menu-icon-img').toggle();
                $('.coffee-cup-btn').find('i').toggle();
            }

            // try to close the trending menu
            if (except !== 'coffee-starbucks-btn' && coffee_starbucks_isOpen) {
                // now close the menu
                coffee_starbucks_isOpen = false;

                // also toggle the notification icons
                $('.coffee-starbucks-btn').find('.menu-icon-img').toggle();
                $('.coffee-starbucks-btn').find('i').toggle();
            }

            // try to close the notification menu
            if (except !== 'notification-btn' && notification_isOpen) {
                // now close the menu
                notification_isOpen = false;

                // also toggle the notification icons
                $('.notification-btn').find('.menu-icon-img').toggle();
                $('.notification-btn').find('i').toggle();

                $('.notification-btn').parent().toggleClass('open');
            }

            // try to close the profile menu
            if (except !== 'profile-btn' && profile_isOpen) {
                // now close the menu
                profile_isOpen = false;

                // also toggle the notification icons
                $('.profile-btn').find('.menu-icon-img').toggle();
                $('.profile-btn').find('i').toggle();

                $('.profile-btn').parent().toggleClass('open');
            }

            // try to close the about menu
            if (except !== 'about-btn' && about_isOpen) {
                // now close the menu
                about_isOpen = false;

                // also toggle the notification icons
                $('.about-btn').find('.menu-icon-img').toggle();
                $('.about-btn').find('i').toggle();

                $('.about-btn').parent().toggleClass('open');
            }

        }
     


    });


}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
 

