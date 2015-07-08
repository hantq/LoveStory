(function($) {
    $.fn.fakeLoader = function() {

        var spinner07 = '<div class="fl spinner7"><div class="circ1"></div><div class="circ2"></div><div class="circ3"></div><div class="circ4"></div></div>';
        var el = $(this);

        //Apply styles
        el.css({
            'position': 'fixed',
            'width': '100%',
            'height': '100%',
            'top': '0px',
            'left': '0px'
        });

        el.html(spinner07);
        centerLoader();

        setTimeout(function(){
            $(el).fadeOut();
        }, 1200);

        //Return Styles
        return this.css({
            'backgroundColor': '#2ecc71',
            'zIndex': '999'
        });
    };

    function centerLoader() {
        var winW = $(window).width();
        var winH = $(window).height();

        var spinnerW = $('.fl').outerWidth();
        var spinnerH = $('.fl').outerHeight();

        $('.fl').css({
            'position': 'absolute',
            'left': (winW/2)-(spinnerW/2),
            'top': (winH/2)-(spinnerH/2)
        });
    }

    $(window).load(function() {
        centerLoader();
        $(window).resize(function() {
            centerLoader();
        });
    });
}(jQuery));


