// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 
    
  
    $(document).ready(function() {
        
        class Elements {

            static searchById(element_classes, id) {
                return $(element_classes).filter(function(index) {
                    return $(this).data('id') === id;
                });
            }



            static searchByAttr(element_classes, attr, value) {
                return $(element_classes).filter(function(index) {
                    return $(this).data(attr) === value;
                });
            }



            static removeById(element_classes, id) {
                $(element_classes).filter(function(index) {
                    return $(this).data('id') === id;
                })
                .remove();
            }



            static removeByAttr(element_classes, attr, value) {
                $(element_classes).filter(function(index) {
                    return $(this).data(attr) === value;
                })
                .remove();
            }







            // Example Post Data
            // 
            // data = {
            //     post_id: 853818343,
            //     userid: 13435343,
            //     username: anirbanroydas,
            //     name: { fullname: Anirban Roy Das,
            //             firstname: Anirban,
            //             middlename: Roy,
            //             lastname: Das,
            //             filteredname: Anirban Roy Das
            //         },
            //     creation_time: '12.34 pm',
            //     creation_date: '12 Nov 2016',
            //     content: "What is your interest in @samuelackhtar's new business, why pry? @janedoes @ivirganner please note this. #nopry #getalife",
            //     mentions: [6, 11, 12],
            //     hastags: [16, 17]
            // }
            // 

            static createPostElement(data) {

                
            }



            static createNotificationElement(data) {
                
            }



            static createCockstreamElement(data) {
                
            }



            static createChatUserElement(data) {
                
            }


            static updateChatUserElement(data) {
                
            }



            static createChatMsgElement(data) {
                
            }

        
        }


    });


}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
 

