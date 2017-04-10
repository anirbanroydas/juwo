// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 
    
  
    $(document).ready(function() {
        
        class Parse {

            static notificationMsg(element_classes, id) {
                return $(element_classes).filter(function(index) {
                    return $(this).data('id') === id;
                });
            }





            static postMsg(element_classes, attr, value) {
                return $(element_classes).filter(function(index) {
                    return $(this).data(attr) === value;
                });
            }






            static chatMsg(element_classes, id) {
                $(element_classes).filter(function(index) {
                    return $(this).data('id') === id;
                })
                .remove();
            }


        
        }


    });


}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
 

