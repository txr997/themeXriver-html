/*

Author: themexriver
Version: 1.0

*/



(function ($) {
"use strict";



// document.addEventListener("DOMContentLoaded", function () {
// 	let preloader = document.querySelector("#preloader");
// 	window.addEventListener('load', function(){
// 	  preloader.classList.add("preloaded");
// 	  setTimeout(function () {
// 			preloader.remove();

// 		});
// 	})
// });



$('.txa-product-details-content-show-more-btn').on('click', function () {
	var $btn = $(this);
	var wasActive = $btn.hasClass('has-active'); 
	
	$btn.toggleClass('has-active');
	$('.txa-product-details-content').toggleClass('has-active');
  
	
	if (wasActive) {
	  $('html, body').animate({
		scrollTop: $btn.offset().top - 400
	  }, 400);
	}
});
  

// mobile-menu-start
if($('.mobile-main-navigation li.dropdown ul').length){
	$('.mobile-main-navigation li.dropdown').append('<div class="dropdown-btn"><i class="flaticon-right-arrow"></i></div>');
	$('.mobile-main-navigation li.dropdown .dropdown-btn').on('click', function() {
		$(this).prev('ul').slideToggle(500);
	});
}

$(".dropdown-btn").on("click", function () {
	$(this).toggleClass("toggle-open");
});

// mobile-menu-end


// gsap-start
gsap.registerPlugin(ScrollTrigger);



// mobile-menu-toggle-start

var menuToggle = document.getElementById("menuToggle")
var menuToggle2 = document.getElementById("menuToggle2")

if (menuToggle2) {

	var menuBar = gsap.timeline();
	menuBar.reverse();
	var menubgline = gsap.timeline({ paused: true });
	
	menubgline.to('.mobile-menu' , {
		duration: 0,
		display: "block",
		ease: 'Expo.easeInOut'
	});
	menubgline.to('.mobile-menu-bg span' , {
		duration: .5,
		height: "100%",
		stagger: 0.1,
		ease: 'Expo.easeInOut'
	});
	menubgline.from('.mobile-menu-logo' , {
		x: -50,
		opacity: 0,
		ease: 'Expo.easeInOut'
	});
	menubgline.to('.mobile-menu-close' , {
		duration: 0,
		x: 0,
		rotate: 0,
		opacity: 1,
		ease: 'Expo.easeInOut'
	}, "<");
	menubgline.from('.mobile-menu-navigation' , {
		opacity: 0,
		x: -50,
		ease: 'Expo.easeInOut'
	});
	menubgline.from('.mobile-menu-search-bar' , {
		opacity: 0,
		y: 50,
		ease: 'Expo.easeInOut'
	}, "<");
	menubgline.from('.mobile-menu-action-link' , {
		opacity: 0,
		x: 50,
		ease: 'Expo.easeInOut'
	}, "<");
	
	menubgline.from('.mobile-menu-socail-link ' , {
		opacity: 0,
		y: 50,
		ease: 'Expo.easeInOut'
	}, "<");
	
	menubgline.reverse();

	menuToggle.addEventListener('click', function(){
		menubgline.reversed(!menubgline.reversed());
	});
	menuToggle2.addEventListener('click', function(){
		menubgline.reversed(!menubgline.reversed());
	});
	
}

// mobile-menu-toggle-end


// mobile-categories-toggle-start

if ($(window).width() <= 575) {

	var categoriesTgogle = document.getElementById("categories-1")
	var categoriesTgogle2 = document.getElementById("categories-close")
	
	if (categoriesTgogle2) {
	
		var categoriesBar = gsap.timeline();
		categoriesBar.reverse();
		var categoriesbgline = gsap.timeline({ paused: true });
		
		categoriesbgline.to('.mobile-categories' , {
			duration: 0,
			display: "block",
			ease: 'Expo.easeInOut'
		});
		categoriesbgline.to('.mobile-categories-bg span' , {
			duration: .5,
			height: "100%",
			stagger: 0.1,
			ease: 'Expo.easeInOut'
		});
		categoriesbgline.from('.mobile-categories-content' , {
			duration: .2,
			y: -100,
			opacity: 0,
			ease: 'Expo.easeInOut'
		});
		categoriesbgline.to('.mobile-categories-close' , {
			duration: 0,
			x: 0,
			rotate: 0,
			opacity: 1,
			ease: 'Expo.easeInOut'
		}, "<");
		categoriesbgline.from('.mobile-categories-navigation' , {
			opacity: 0,
			x: -50,
			ease: 'Expo.easeInOut'
		});
		
		
		categoriesbgline.reverse();
		categoriesTgogle.addEventListener('click', function(){
			// menuBar.reversed(!menuBar.reversed());
			categoriesbgline.reversed(!categoriesbgline.reversed());
		});
		categoriesTgogle2.addEventListener('click', function(){
			// menuBar.reversed(!menuBar.reversed());
			categoriesbgline.reversed(!categoriesbgline.reversed());
		});
	}
 }



// mobile-categories-toggle-end

var tl = gsap.timeline({
	repeat: -1,
  });
  
  tl.from(".img-path-3", {
	  opacity: 0,
	  duration: 1
  },"1")
  tl.from(".img-path-3", {
	  right: "0%",
	  duration: 2
  })
  tl.from(".img-path-1", {
	opacity: 0,
	duration: .5
  })
  tl.from(".img-path-1", {
	  top: "50%",
	  left: "10%",
	  width: "30%",
	  duration: 2
  },)
  tl.to(".img-path-1", {
	opacity: 0,
	duration: .5
  })
  tl.to(".img-path-3", {
	opacity: 0,
	duration: .5
  })


const boxes = gsap.utils.toArray('.txa-showcase-1-item-img');
boxes.forEach(img => {
	gsap.to(img, {
		scrollTrigger: {
			trigger: img,
			scrub: 1,
			start: "top 80%",
			end: "bottom bottom",
			toggleClass: "active",
			toggleActions: "play none none none",
			once: true,
		}
	});
});

gsap.utils.toArray('.chy-footer-4-il-img').forEach((el, index) => { 
	let chyScl = gsap.timeline({
	  scrollTrigger: {
		trigger: el,
		scrub: 2,
		start: "top 80%",
		end: "top 70%",
		toggleActions: "play none none reverse",
		 markers: false
	  }
	})
	
	chyScl
	.set(el, {transformOrigin: 'center center'})
	.fromTo(el, { xPercent: -100  }, { xPercent:0 , duration: 1, immediateRender: false})
  })

var abimg1 = gsap.timeline({

	scrollTrigger: {
	  animation: abimg1,
	  trigger: ".txa-about-1-img-2",
	  start: "top 85%",
	  end: "top -50%",
	  toggleActions: "play reverse play reverse",
	  markers: false
	}
	});
	abimg1.from( ".txa-about-1-img-2" , { xPercent: 50,  duration:1 , ease: "power4.out" } )
		  .from( ".txa-about-1-img-2" , { rotateZ: 20 } , ".1" )
		  .from( ".txa-about-1-img-3" , { xPercent: -50,  duration:1 , ease: "power4.out"} , "<" )


var team1 = gsap.timeline({

		scrollTrigger: {
		animation: team1,
		trigger: ".txa-team-membar",
		start: "top 80%",
		end: "top -50%",
		toggleActions: "play none play reverse",
		markers: false,
		stagger: 0.2
		}
	});
	team1.from( ".txa-team-membar" , { opacity:0 ,  duration:.3 , stagger: 0.1 } )
		 .from( ".txa-team-membar-img-wrap" , { transform: "rotate3d(1, 1, 1, 90deg)",  duration:.7 , stagger: 0.2 }, "<" )
		 .from( ".txa-team-membar-img .main-img" , { yPercent: 100,  duration:.7 , stagger: 0.2 } , ".1" )
		 

// marquee-animation-1-start

var marqueeContent = document.querySelector('.txa-life-1-item-wrap');


if (marqueeContent) {
	const txaMarquee = gsap.timeline({ repeat: -1 });

	txaMarquee.fromTo('.txa-life-1-item-wrap', { x: '100%' }, { x: '0%', duration: 20, ease: 'linear' });
	
	marqueeContent.addEventListener('mouseenter', () => {
		txaMarquee.pause();
	});
	  
	marqueeContent.addEventListener('mouseleave', () => {
		txaMarquee.play();
	});
}

// marquee-animation-1-end

// marquee-animation-2-start
var marqueeContent2 = document.querySelector('.txa-life-1-item-wrap-2');

if (marqueeContent2) {
	const txaMarquee2 = gsap.timeline({ repeat: -1 });

	txaMarquee2.fromTo('.txa-life-1-item-wrap-2', { x: '0%' }, { x: '100%', duration: 20, ease: 'linear' });
	
	marqueeContent2.addEventListener('mouseenter', () => {
		txaMarquee2.pause();
	});
	  
	marqueeContent2.addEventListener('mouseleave', () => {
		txaMarquee2.play();
	});
}

// marquee-animation-2-end

// gsap-end


// theme-page-view-toggle-start

if($(".txa-item-view-toggle").length) {
	var products = $(".txa-themes-page-item"),
	allButton = $(".txa-item-view-toggle div"),
	grid4 = $(".grid-view"),
	grid3 = $(".grid-2x-view"),
	listView = $(".list-view");

	allButton.each(function() {
		var $this = $(this);
		$this.on("click", function(e) {
			e.preventDefault();
			$this.addClass("active").siblings().removeClass('active');
			e.stopPropagation();
		})
	});

	grid4.on("click", function(f) {
		products.removeClass("list-view three-column");
		products.addClass("default-column");
		f.stopPropagation();
	});

	grid3.on("click", function(g) {
		products.removeClass("default-column list-view");
		products.addClass("three-column");
		g.stopPropagation();
	});

	listView.on("click", function(h) {
		products.removeClass("default-column three-column");
		products.addClass("list-view");
		h.stopPropagation();
	});
};

// theme-page-view-toggle-start


// hover-parallax-start

document.addEventListener("mousemove" , parallax);
function parallax(e){

	document.querySelectorAll(".object").forEach(function(move){

		var moving_value = move.getAttribute("data-value");
		var x = (e.clientX * moving_value) /250;
		var y = (e.clientY * moving_value) /250;

		move.style.transform = "translateX(" + x + "px) translateY(" + y +"px)";
	})

}

// hover-parallax-start

// categorie-slider-start

var txacategorie1 = new Swiper(".txa-categorie-1-active", {
    loop: true,
    speed: 1000,
    autoplay: {     //add
        delay: 4000,   //add
    },   
	navigation: {
		nextEl: ".txa_c1_next",
		prevEl: ".txa_c1_prev",
	},
});

// categorie-slider-end


// testimonial-slider-start

let txat1 = new Swiper('.txa-t1-active', {
	loop: true,
	spaceBetween: 0,
	speed: 1000,
    autoplay: {     //add
        delay: 4000,   //add
    }, 
	navigation: {
		nextEl: ".txa_t1_next",
		prevEl: ".txa_t1_prev",
	},
	breakpoints: {
		768: {
		  slidesPerView: 1,
		},
		992: {
		  slidesPerView: 2,
		},
	},

});

// testimonial-slider-end


// art-details-slider-start

let artthumbs = new Swiper('.txa-art-d-preview-img-active', {
	spaceBetween: 15,
	loop: true,
	speed: 1000,
	slidesPerView: 3,
	rtl: false,
	watchSlidesProgress: false,	
	breakpoints: {
		320: {
		slidesPerView: 2,
		},
		576: {
		slidesPerView: 3,
		},
		768: {
		slidesPerView: 3,

		},
		992: {
		slidesPerView: 3,
		},
		1200: {
		slidesPerView: 3,
		},
	}
});



let artdetails = new Swiper('.txa-art-d-main-img-active', {
	loop: true,
	spaceBetween: 0,
	rtl: false,
	slidesPerView: 1,
	autoplay: {
		delay: 4000,
	},
	navigation: {
		nextEl: ".art_details_next",
		prevEl: ".art_details_prev",
	},
	thumbs: {
		swiper: artthumbs,
	},
});


// art-details-slider-end

// art-details-carsor-start

var element = document.querySelector('.cursor');
if (element) {
	var cursor = document.querySelector('.cursor');

	document.addEventListener('mousemove', function(e){
	  var x = e.clientX;
	  var y = e.clientY;
	  cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`
	});
	
} 

// art-details-carsor-end


// art-collection-start

var element2 = document.querySelector('.cursor2');
if (element2) {
	var cursor2 = document.querySelector('.cursor2');

	document.addEventListener('mousemove', function(e){
	  var x = e.clientX;
	  var y = e.clientY;
	  cursor2.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`
	});
	
} 

// art-collection-start


// plugin-testimonial-marquee
const marquee = document.querySelector(".marquee");

if (marquee) {

	$('.marquee').marquee({
		duration: 15000,
		gap: 25,
		pauseOnHover: true,
		delayBeforeStart: 0,
		direction: 'left',
		startVisible:true,
		duplicated: true
	});

}





// plugin-testimonial-marquee-2
const marquee2 = document.querySelector(".marquee2");

if (marquee2) {

	$('.marquee2').marquee({
		duration: 15000,
		gap: 25,
		pauseOnHover: true,
		delayBeforeStart: 0,
		direction: 'right',
		startVisible:true,
		duplicated: true
	});

}



/*
faq-active-class
====start====
*/
$(document).on('click', '.accordion-item', function(){
	$(this).addClass('faq_bg').siblings().removeClass('faq_bg')
})
/*
faq-active-class
====end====
*/


/*
back-to-top
=====start==== */
var backtotop = $('.scroll-top');

$(window).scroll(function() {
	if ($(window).scrollTop() > 300) {
	backtotop.addClass('show');
	} else {
	backtotop.removeClass('show');
	}
});

backtotop.on('click', function(e) {
	e.preventDefault();
	$('html, body').animate({scrollTop:0}, '700');
});
/*
back-to-top
=====end==== 
*/


/*
popup-img-activition
====start====
*/

var element = document.querySelector('.popup-image');
if (element) {
	$('.popup-image').magnificPopup({
		type: 'image',
		mainClass: 'mfp-with-zoom', // this class is for CSS animation below
	  
		zoom: {
		  enabled: true, // By default it's false, so don't forget to enable it
	  
		  duration: 500, // duration of the effect, in milliseconds
		  easing: 'ease-in-out', // CSS transition easing function
	  
		  // The "opener" function should return the element from which popup will be zoomed in
		  // and to which popup will be scaled down
		  // By defailt it looks for an image tag:
		  opener: function(openerElement) {
			// openerElement is the element on which popup was initialized, in this case its <a> tag
			// you don't need to add "opener" option if this code matches your needs, it's defailt one.
			return openerElement.is('img') ? openerElement : openerElement.find('img');
		  }
		}
	  
	});
	
} 

/*
popup-img-activition
====end====
*/

/*
nice-selector-activiton
====start====
*/
var niceselect = document.querySelector(".nice-select");
if (niceselect) {
	$('.nice-select select').niceSelect();
}
/*
nice-selector-activiton
=====end==== 
*/



/*
counter-activition
====start====
*/
$('.counter').counterUp({
	delay: 10,
	time: 3000
});
/*
counter-activition
====end====
*/


/*
data-bg-activition
====start====
*/
$("[data-background]").each(function(){
	$(this).css("background-image","url("+$(this).attr("data-background") + ") ")
})
/*
data-bg-activition
====end====
*/


if($(".txa-sidebar-widget-subscription").length) {
	const el = document.querySelector(".txa-sidebar-widget-subscription");
	function startSwing() {
	  el.classList.add("animate__swing");
	  setTimeout(() => {
		el.classList.remove("animate__swing");
		setTimeout(startSwing, 500); 
	  }, 1000); 
	}
	
	startSwing();
}




})(jQuery);