(function (global) {
  'use strict';

  var closeNav = function() {
    $("#nav-button").removeClass('open');
    $("#nav-links").removeClass('open');
//    $("#nav-sublinks").removeClass('open');
  };

  $("#nav-button").click(function() {
    $("#nav-button").toggleClass('open');
    $("#nav-links").toggleClass('open');
//    $("#nav-sublinks").toggleClass('open');
    return false;
  });

  $(".page-content").click(closeNav);
  $(".navbar").click(closeNav);
})(window);
