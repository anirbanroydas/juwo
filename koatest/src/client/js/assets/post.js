// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 

    let welcomeLoader = true;
  
    $(document).ready(function() {


        // Post Area Methods
        let $post_area = $('.juwo-textarea');
        let postarea_isError = false;


        $('html').click(function(event) {
            toggle_post_textarea_errormsg();
        });





        function toggle_post_textarea_errormsg() {
            
            
            // try to close the trending menu
            if (postarea_isError) {
                // now close the menu
                postarea_isError = false;

                // also toggle the notification icons
                if ($post_area.hasClass('error-post-area')) {
                    $post_area.removeClass('error-post-area');
                }
                if ($post_area.hasClass('juwo-textarea-errored')) {
                    $post_area.removeClass('juwo-textarea-errored');
                }

                $post_area.attr('placeholder', 'What you want to share?');
            }

        }



        $('.post-btn').click(function(event) {
            event.preventDefault();
            event.stopPropagation();

            let post_msg = $post_area.val().trim();

            if (post_msg.length < 1) {
                $post_area.addClass('error-post-area');

                $post_area.attr('placeholder', 'Post message cannot be empty!');
                $post_area.addClass('juwo-textarea-errored');

                postarea_isError = !postarea_isError;
            }
            else {
                if ($post_area.hasClass('error-post-area')) {
                    $post_area.removeClass('error-post-area');
                }

                if ($post_area.hasClass('juwo-textarea-errored')) {
                    $post_area.removeClass('juwo-textarea-errored');
                }

                $post_area.attr('placeholder', 'What you want to share?');
            }
        });
	

        $post_area.click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            
        });





        let count;
        let post_characters_limit = 256;

    
        $post_area.on("keyup", function () {
            count = post_characters_limit - $post_area.val().length;

            $('.post-textarea-count').text(count);

            if (count < 0) {
                $('.post-textarea-count').addClass('text-limit-reached');
            }
            else {
                $('.post-textarea-count').removeClass('text-limit-reached');
            }

        });
    
    
    
        $post_area.on("cut", function (event) {
            
            setTimeout(function(){
                count = post_characters_limit - $post_area.val().length;
                $('.post-textarea-count').text(count);

                if (count < 0) {
                    $('.post-textarea-count').addClass('text-limit-reached');
                }
                else {
                    $('.post-textarea-count').removeClass('text-limit-reached');
                }

            }, 10);
            
        });
    
        $post_area.on("paste", function (event) {

            setTimeout(function(){
                count = post_characters_limit - $post_area.val().length;
                $('.post-textarea-count').text(count);

                if (count < 0) {
                    $('.post-textarea-count').addClass('text-limit-reached');
                }
                else {
                    $('.post-textarea-count').removeClass('text-limit-reached');
                }
                                
            }, 10);
            
        });




        // post item action handlers
        
        // $('.post-item-actions .post-item-action').hover(function(event) {
        //     event.preventDefault();
            
        //     if (!$(this).hasClass('like-action')) {
        //         $(this).find('.before-action').toggle();
        //         $(this).find('.after-action').toggle();
        //     }          
            
        // });
        

        // handle like event
        $('.post-item-actions .like-action').click(function(event) {
            event.preventDefault();
            // $(this).toggleClass('isClicked');
            $(this).find('.before-action').toggle();
            $(this).find('.after-action').toggle();
            
        });



        // handle comment event
        $('.post-item-stats .comments-stat').click(commentHandler);        
        $('.post-item-actions .comment-action').click(commentHandler);


        function commentHandler(event) {
            event.preventDefault();
            // $(this).toggleClass('isClicked');
            
            let $commentsBlock = $(this).closest('.post-item').find('.post-item-comments');
            let $comments = $($commentsBlock).find('.post-item-comment');
            let $commentTextareaBlock = $(this).closest('.post-item').find('.post-item-comment-textarea-wrapper');

            console.log('commentsBlock.length : ', $commentsBlock.length);
            console.log('comments.length : ', $comments.length);

            if ($comments.length > 1) {
                
                let $unviewedCommentsBlock = $($commentsBlock).find('.post-item-comment-load-more-wrapper');
                let $unviewedCommentsElement = $unviewedCommentsBlock.find('.post-item-comment-load-more');

                let unviewedComments = parseInt($unviewedCommentsElement.data('unviewed-comments'));

                if (unviewedComments > 0) {
                    let unviewedCommentsMsg =  "view previous " + unviewedComments + " comments...";

                    $unviewedCommentsElement.text(unviewedCommentsMsg);
                    $unviewedCommentsBlock.show();
                }

                $commentTextareaBlock.find('.post-item-comment-textarea').attr("Write a comment");
            }
            else {
                $commentTextareaBlock.find('.post-item-comment-textarea').attr("placeholder", "Write the first comment");
            }

            $commentsBlock.toggle();
            $commentTextareaBlock.toggle();
            $(this).closest('.post-item').toggleClass('post-item-padding-bottom');
                  
        }



        // post item comment handlers
        
        $('.post-item-comment .post-item-comment-load-more').click(function(event) {

                event.preventDefault();
                event.stopPropagation();

                if ($(this).data('disabled')) {
                    return;
                }
                else {
                    $(this).data('disabled', true);
                    $(this).toggleClass('cursor-hand-class');
                    $(this).toggleClass('cursor-default-class');
                    $(this).parent().find('.post-item-comment-loading-img').show();

                    setTimeout(loadCommentsHandler.bind(this), 3000);
                }
                
        });



        function loadCommentsHandler() {
            $(this).parent().find('.post-item-comment-loading-img').hide();

            let unviewedComments = parseInt($(this).data('unviewed-comments'));

            console.log('original unviewed Comments : ', unviewedComments);


            let comments = [
                {user:'robinwilliams', msg:"The gang's all here! #Brooklyn99"},
                {user:'karishmak', msg:"I always read the photo 😂"},
                {user:'newsophia', msg:"We want to know what Capt.Holt thinks of Beyoncé's Lemonade"},
                {user:'realkk', msg:"@chelsanity #rejected "},
                {user:'aplusk', msg:"Yeah Chelsea's not here!! And neither is Stephanie!! @chelsanity"},
                {user:'nor_wk', msg:"My rockstar mom#AminaSaleem felicitated at 9th National Women's Excellence Awards..So proud of her and her work for women&education #love 🙏👏"},
                {user:'ardroy', msg:"This is so stylish 😍😘😍😘 @rannvijaysingha ❤❤"},
                {user:'udrokcs', msg:"Soooooooooo stylish 😍😍😍😘😘😘😍😍😍❤❤ @rannvijaysingha"},
                {user:'elixir_17', msg:"Gorgeous girl ever"}, 
                {user:'little_carmen', msg:"So beautiful looks"}
            ];

            let commentNum = Math.min(unviewedComments, getRandomInt(3, 13));
            let index;
            let count = commentNum;

            console.log('random comment num : ', commentNum);
            
            while (count > 0) {
                index = getRandomInt(1, 10);
                addComment.call(this, comments[index - 1].msg, 'prepend', comments[index - 1].user);
                count--;
            }

            unviewedComments = unviewedComments - commentNum;

            console.log('new unviewed Comments : ', unviewedComments); 

            $(this).data('unviewed-comments', unviewedComments);              

            if (unviewedComments > 0) {
                let unviewedCommentsMsg =  "view previous " + unviewedComments + " comments...";

                $(this).text(unviewedCommentsMsg);
                $(this).data('disabled', false);
                $(this).toggleClass('cursor-hand-class');
                $(this).toggleClass('cursor-default-class');
            }
            else {
                $(this).parent('.post-item-comment-load-more-wrapper').hide();
            }

        }



        // Returns a random integer between min (included) and max (included)
        // Using Math.round() will give you a non-uniform distribution!
        function getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }





        let comment_count;
        let comment_characters_limit = 256;

    
        $('.post-item-comment-textarea').on("keyup", function (event) {

            let code = event.keycode || event.which;
            console.log('key_code : ', code);

            if (code === 13) {
                console.log('sending comment');

                let comment_msg = $(this).val().trim();

                console.log('comment msg: ', comment_msg);
                console.log('comment msg len: ', comment_msg.length);

                if (comment_msg.length < 1) {

                    console.log('commetn msg len is empyt, hence retruning');
                    return;
                }
                else {
                    console.log('commetn msg len more than 0');
                    let username = $(this).data('username');
                    addComment.call(this, comment_msg, 'append', username);
                }
            }
            

        });
    
  
        function addComment(msg, position, user) {
            console.log('inside addComment, this : ', this);
            console.log('this.target : ', this.target);
            // <div class="post-item-comment">
            //     <a class="post-item-comment-username">kunalshah</a>nothing to say <a class="post-comment-hashtag">#maleChauvinism</a> it is.
            // </div>
            
            let $post_item_comment_div_element = $('<div class="post-item-comment">');
            let $post_item_comment_username_a_element = $('<a class="post-item-comment-username">');

            $post_item_comment_div_element.text(msg);
            $post_item_comment_username_a_element.text(user);
            $post_item_comment_div_element.prepend($post_item_comment_username_a_element);

            let $post_item_comments_block = $(this).closest('.post-item').find('.post-item-comments');

            if (position === 'append') {
                $post_item_comments_block.append($post_item_comment_div_element);
            }
            else if (position === 'prepend') {

                let $post_item_unviewed_comments_block = $post_item_comments_block.find('.post-item-comment-load-more-wrapper');
                
                if ($post_item_unviewed_comments_block.length > 0) {
                    $post_item_unviewed_comments_block.after($post_item_comment_div_element);
                }
                else {
                    $post_item_comments_block.prepend($post_item_comment_div_element); 
                }

                
            }
            
            let $post_item_comment_textarea = $(this).closest('.post-item').find('.post-item-comment-textarea');

            $post_item_comment_textarea.val('');
            $post_item_comment_textarea.css({"height": "55px"});
            $post_item_comment_textarea.attr("placeholder", "Write a comment");
        }

        

        


    });

}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
