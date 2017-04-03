(function ($) {
    
    // Add smooth scrolling to all links in navbar
    $(".navbar a, .quick-info li a").on('click', function(event) {
        event.preventDefault();
        console.debug();
        if(!$(this).hasClass('login')) {
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 900, function(){
                window.location.hash = hash;
            });
        } else { // if it was clicked in LOGAR
            window.location.href = "/login";
        }

    });
       
    //jQuery to collapse the navbar on scroll
    $(window).scroll(function() {
        if ($(".navbar-default").offset().top > 50) {
            $(".navbar-fixed-top").addClass("top-nav-collapse");
        } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
        }
    });
    
})(jQuery);