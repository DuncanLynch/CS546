$(function (){
    let requestConfig = {
        method: 'GET',
        url: '/class'
    };

    $.ajax(requestConfig).then(function (responseMessage){
        const workInProgress = "Gonna print the first 10 classes then allow search";
    });
})(window.jQuery);