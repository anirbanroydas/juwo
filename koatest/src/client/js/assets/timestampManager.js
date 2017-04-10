// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

    // The $ is now locally scoped 
    
  
    $(document).ready(function() {
        // console.log('timeManager document ready');

        let timestampSecondsInterval = 20000;
        let $timestampActiveElements = $('.active-timestamp');
        let timestampSecondsDiff;
        
        // run the function every time interval seconds
        setInterval(timestampSecondsManage, timestampSecondsInterval);

        function timestampSecondsManage() {
            // console.log('setInterval called - timestampSecondsManage');

            $('.seconds-timestamp').each(function(index) {
                // console.log('this - %s  at  %s', $(this).data('locale-date'), $(this).data('locale-time'));

                timestampSecondsDiff = Date.now() - parseInt($(this).data('utc-timestamp'));

                // time in milliseconds, 60*1000
                if (timestampSecondsDiff >= 60000) {
                    $(this).removeClass('seconds-timestamp');
                    $(this).addClass('minutes-timestamp');

                    $(this).text(Math.floor(timestampSecondsDiff/60000) + 'm');
                }
                else {
                    $(this).text(Math.round(timestampSecondsDiff/1000) + 's');
                }

            });
        }


        let timestampMinutesInterval = 60000;
        let timestampMinutesDiff;
        
        // run the function every time interval seconds
        setInterval(timestampMinutesManage, timestampMinutesInterval);

        function timestampMinutesManage() {
            // console.log('setInterval called - timestampMinutesManage');
            
            $('.minutes-timestamp').each(function(index) {
                // console.log('this - %s  at  %s', $(this).data('locale-date'), $(this).data('locale-time'));

                timestampMinutesDiff = Date.now() - parseInt($(this).data('utc-timestamp'));

                // time in milliseconds, 60*60*1000
                if (timestampMinutesDiff >= 3600000) {
                    $(this).removeClass('minutes-timestamp');
                    $(this).addClass('hours-timestamp');

                    $(this).text(Math.floor(timestampMinutesDiff/3600000) + 'h');
                }
                else {
                    $(this).text(Math.floor(timestampMinutesDiff/60000) + 'm');
                }

            });
        }



        let timestampHoursInterval = 3600000;
        let timestampHoursDiff, timestampYesterday;
        
        // run the function every time interval seconds
        setInterval(timestampHoursManage, timestampHoursInterval);

        function timestampHoursManage() {
            // console.log('setInterval called - timestampHoursManage');
            
            $('.hours-timestamp').each(function(index) {
                // console.log('this - %s  at  %s', $(this).data('locale-date'), $(this).data('locale-time'));

                timestampHoursDiff = Date.now() - parseInt($(this).data('utc-timestamp'));
                timestampYesterday = $(this).data('locale-time');
                
                // time in milliseconds, 24*60*60*1000
                if (timestampHoursDiff >= 86400000) {
                    $(this).removeClass('hours-timestamp');
                    $(this).addClass('yesterday-timestamp');

                    $(this).text('Yesterday at ' + timestampYesterday);
                }
                else {
                    $(this).text(Math.floor(timestampHoursDiff/3600000) + 'h');
                }

            });
        }




        let timestampYesterdayInterval = 3600000;
        let timestampYesterdayDiff, timestampGeneral, timestampDate;
        
        // run the function every time interval seconds
        setInterval(timestampYesterdayManage, timestampYesterdayInterval);

        function timestampYesterdayManage() {
            // console.log('setInterval called - timestampYesterdayManage');
            
            $('.yesterday-timestamp').each(function(index) {
                // console.log('this - %s  at  %s', $(this).data('locale-date'), $(this).data('locale-time'));

                timestampYesterdayDiff = Date.now() - parseInt($(this).data('utc-timestamp'));

                timestampGeneral = $(this).data('locale-time');
                timestampDate = $(this).data('locale-date');

                if (!Sugar.Date.create(timestampDate).isYesterday()) {
                    $(this).removeClass('yesterday-timestamp');
                    $(this).addClass('general-timestamp');

                    $(this).text(timestampDate + ' at ' + timestampGeneral);
                }
                else {
                    $(this).text('Yesterday at ' + timestampGeneral);
                }
            });
        }


    });


}(window.jQuery, window, document));
// The global jQuery object is passed as a parameter
 

