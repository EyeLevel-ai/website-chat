/*
Copyright (c) 2018
------------------------------------------------------------------*/
(function ($) {
	"use strict";
	var Fitness_First = {
		initialised: false,
		version: 1.0,
		mobile: false,
		init: function () {
			if(!this.initialised) {
				this.initialised = true;
			} else {
				return;
			}
			/*-------------- Fitness First Functions Calling ------------*/
			this.Slider();
			this.video_popup();
			this.counter();
			this.Toggle_menu();
			this.Image_popup();
			this.Ajax();
		},
		/*-------------- Fitness First Functions definition ------------ */
		Slider: function() {
			if($('.ff_banner_wrapper').length > 0){
				$('.owl-carousel').owlCarousel({
					loop:true,
					margin:0,
					nav:true,
					mouseDrag: false,
					autoplay:true,
					smartSpeed:1000,
					responsive:{
						0:{
							items:1
						},
						600:{
							items:1
						},
						1000:{
							items:1
						}
					}
				})
			}
		},
		video_popup: function() {
			if($('.ff_video_overlay .popup-video').length > 0){		
				$('.popup-video').magnificPopup({
					delegate: 'a',
					type: 'iframe',
					tLoading: 'Loading image #%curr%...',
					mainClass: 'mfp-with-zoom',
					gallery: {
					enabled: true,
					navigateByImgClick: true,
					preload: [0,1] // Will preload 0 - before current, and 1 after the current image
					},
					image: {
						tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
						titleSrc: function(item) { 
						  return item.el.attr('title') + '<small></small>';
						}
					}
				});
			}
  		},
  		counter: function() {
			if($('.ff_counter_box').length > 0){
				$('.timer').appear(function(){
			    	$(this).countTo();
			    });
			}
		},
		 //Menu
        Toggle_menu: function() {
            $(".ff_toggle_btn").on('click', function() {
                $(".ff_menu").addClass('open_menu');
            });
            $(".ff_close_btn").on('click', function() {
                $(".ff_menu").removeClass('open_menu');
            });
            $('.ff_menu ul li.dropdown').children('a').append(function() {
                return '<div class="dropdown-expander"><i class="fa fa-angle-down"></i></div>';
            });
            $(".ff_menu ul > li:has(ul) > a").on('click', function(e) {
                var w = window.innerWidth;
                if (w <= 991) {
                    e.preventDefault();
                    $(this).parent('.ff_menu ul li').children('ul.sub-menu').slideToggle();
                }
            });
		},
		Image_popup: function() {
			if($('.ff_gallery_box .popup-gallery').length > 0){		
				$('.popup-gallery').magnificPopup({
					delegate: 'a',
					type: 'image',
					gallery:{
						enabled:true
					},
					mainClass: 'mfp-with-zoom', // this class is for CSS animation below
					zoom: {
					enabled: true, 
					duration: 300,
					easing: 'ease-in-out',
						opener: function(openerElement) {
							return openerElement.is('img') ? openerElement : openerElement.find('i');
						}
					}
				});
			}
		},
		Ajax: function() {
			function checkRequire(formId , targetResp){
				targetResp.html('');
				var email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
				var url = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
				var image = /\.(jpe?g|gif|png|PNG|JPE?G)$/;
				var mobile = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;
				var facebook = /^(https?:\/\/)?(www\.)?facebook.com\/[a-zA-Z0-9(\.\?)?]/;
				var twitter = /^(https?:\/\/)?(www\.)?twitter.com\/[a-zA-Z0-9(\.\?)?]/;
				var google_plus = /^(https?:\/\/)?(www\.)?plus.google.com\/[a-zA-Z0-9(\.\?)?]/;
				var check = 0;
				$('#er_msg').remove();
				var target = (typeof formId == 'object')? $(formId):$('#'+formId);
				target.find('input , textarea , select').each(function(){
					if($(this).hasClass('require')){
						if($(this).val().trim() == ''){
							check = 1;
							$(this).focus();
							targetResp.html('Alcuni campi risultano incompleti.');
							$(this).addClass('error');
							return false;
						}else{
							$(this).removeClass('error');
						}
					}
					if($(this).val().trim() != ''){
						var valid = $(this).attr('data-valid');
						if(typeof valid != 'undefined'){
							if(!eval(valid).test($(this).val().trim())){
								$(this).addClass('error');
								$(this).focus();
								check = 1;
								targetResp.html($(this).attr('data-error'));
								return false;
							}else{
								$(this).removeClass('error');
							}
						}
					}
				});
				return check;
			}
			$(".submitForm").on("click", function() {
				var _this = $(this);
				var targetForm = _this.closest('form');
				var errroTarget = targetForm.find('.response');
				var check = checkRequire(targetForm , errroTarget);
				if(check == 0){
					var formDetail = new FormData(targetForm[0]);
					formDetail.append('form_type' , _this.attr('data-form-type'));
					$.ajax({
						method : 'post',
						url : './assets/ajax.php',
						data:formDetail,
						cache:true,
						contentType: false,
						processData: false
					}).done(function(resp){
						if(resp == 1){
							targetForm.find('input').val('');
							targetForm.find('textarea').val('');
							errroTarget.html('<p style="color:green;">La tua richiesta è stata inviata correttamente.<br>Se hai inserito tutte le informazioni in modo corretto, a breve riceverai una mail con le istruzioni per completare l ordine.<br></p>');
						}else{
							errroTarget.html('<p style="color:red;">Qualcosa è andato storto, per favore riprova più tardi.</p>');
						}
					});
				}
			});
		}
	};
Fitness_First.init();
/*-------- Fixed Menu -------*/
$(window).scroll(function(){
	var window_top = $(window).scrollTop() + 1; 
	if (window_top > 400) {
		$('.ff_header').addClass('menu_fixed');
	} else {
		$('.ff_header').removeClass('menu_fixed');
	}
});
jQuery(window).on('load', function() {
	jQuery("#status").fadeOut();
	jQuery("#preloader").delay(350).fadeOut("slow");
});
/* ------ Single page scroll js --------- */
$('.ff_menu ul li a').on('click' , function(e){
	$('.ff_menu ul li a').removeClass('active');
	$(this).parent().addClass('active');
	var target = $('[data-scroll='+$(this).attr('href')+']');
	e.preventDefault();
	var targetHeight = target.offset().top-72;
	$('html, body').animate({
		scrollTop: targetHeight
	}, 1000);
});
$(window).scroll(function() {
	var windscroll = $(window).scrollTop();
	var target = $('.ff_menu ul li');
	if (windscroll >= 0) {
		$('[data-scroll]').each(function(i) {
			if ($(this).position().top <= windscroll + 78) {
				target.removeClass('active');
				target.eq(i).addClass('active');
			}
		});
	}else{
		target.removeClass('active');
		$('.ff_menu ul li:first').addClass('active');
	}
});
}(jQuery));