/*

Author: themexriver
Version: 2.0

*/



(function ($) {
"use strict";


gsap.config({
	nullTargetWarn: false,
});

/* 
    marquee-left
*/
$('.wa_marquee_left').marquee({
	speed: 18,
	gap: 0,
	delayBeforeStart: 0,
	startVisible:true,
	direction: 'left',
	duplicated: true,
	pauseOnHover: true,
})



/* 
    marquee-left
*/
$('.wa_marquee_np_left').marquee({
	speed: 30,
	gap: 0,
	delayBeforeStart: 0,
	startVisible:true,
	direction: 'left',
	duplicated: true,
	pauseOnHover: false,
})


/* 
    marquee-left
*/
$('.wa_marquee_np_right').marquee({
	speed: 30,
	gap: 0,
	delayBeforeStart: 0,
	startVisible:true,
	direction: 'right',
	duplicated: true,
	pauseOnHover: false,
})


  
/* 
	testimonial-1-slider-active
*/
if ($('.nm_t1_preview_slider_active').length) {

	const nm_t1_preview_slider_active = new Swiper('.nm_t1_preview_slider_active', {
		speed: 500,
		slidesPerView: "auto",
		spaceBetween: 20,
		allowTouchMove: false, 

	});
  
	const nm_t1_main_slider_active = new Swiper('.nm_t1_main_slider_active', {
		speed: 500,
		slidesPerView: "auto",
		effect: "fade",
		allowTouchMove: false, 
		fadeEffect: { crossFade: true },
		navigation: {
			nextEl: ".kk_t1_next",
			prevEl: ".kk_t1_prev",
		},
		thumbs: {
			swiper: nm_t1_preview_slider_active,
		},
	});
  
}
  

if($('.txa-testimonial-3-preview-slider').length) { 
	const slides = document.querySelectorAll(".txa-testimonial-3-preview-slider .swiper-slide");
	const wrapper = document.querySelector(".txa-testimonial-3-preview-slider .swiper-wrapper");
  
	const radius = 520; 
	const centerX = wrapper.clientWidth / 2;
	const centerY = wrapper.clientHeight / 2;
	const total = slides.length;
	const angleStep = (2 * Math.PI) / total;
  
	slides.forEach((slide, index) => {
	  const angle = index * angleStep;
	  const x = centerX + radius * Math.cos(angle) - slide.clientWidth / 2;
	  const y = centerY + radius * Math.sin(angle) - slide.clientHeight / 2;
  
	  slide.style.left = `${x}px`;
	  slide.style.top = `${y}px`;
	});
}

var t1scrollAni = gsap.timeline({
		scrollTrigger: {
			trigger: ".txa-testimonial-3-preview-slider",
			toggleActions: "play none none reverse",
			scrub: 1,
			markers: false,
		},
	});

t1scrollAni.fromTo(".txa-testimonial-3-preview-slider .swiper-wrapper", {
	rotation: 40,
},{rotation: -40});


/* 
	price-toggle-function
*/
if($(".txa-price-2-toggle").length) {
	$('.txa-price-2-toggle').on('click', function () {
		$(".txa-price-2-toggle").toggleClass('is-active');
		$('.package-price-wrap').toggleClass('is-active');
	});
}





/* 
	marquee-down-top 
*/
if ($(".wa_marquee_down_top").length) {
  document.querySelectorAll(".wa_marquee_down_top").forEach((waMarqueeTop) => {
    const waMarqueeClone = waMarqueeTop.cloneNode(true);
    waMarqueeTop.parentNode.appendChild(waMarqueeClone);

    const waMarqueeTotalHeight = waMarqueeTop.offsetHeight;

    gsap.to([waMarqueeTop, waMarqueeClone], {
      y: `-${waMarqueeTotalHeight}px`,
      ease: "none",
      duration: 20,
      repeat: -1,
      modifiers: {
        y: gsap.utils.unitize((waY) => parseFloat(waY) % waMarqueeTotalHeight),
      },
    });
  });
}


/* 
	marquee-top-down 
*/
if ($(".wa_marquee_top_down").length) { 
	const waMarqueeTopDown = document.querySelector('.wa_marquee_top_down');
	const waMarqueeTopDownClone = waMarqueeTopDown.cloneNode(true);
	waMarqueeTopDown.parentNode.appendChild(waMarqueeTopDownClone);
	
	const waMarqueeTopDownHeight = waMarqueeTopDown.offsetHeight;
	
	gsap.to(".wa_marquee_top_down", {
	  y: `${waMarqueeTopDownHeight}px`, 
	  ease: "none",
	  duration: 20,
	  repeat: -1,
	  modifiers: {
		y: gsap.utils.unitize(waY => parseFloat(waY) % waMarqueeTopDownHeight)
	  }
	});
}

/* 
	cta2ani
*/

var cta2ani = gsap.timeline({
	scrollTrigger: {
		trigger: ".txa-cta-2-wrap",
		toggleActions: "play none none reverse",
		start: "top 80%",
		markers: false,
	}
})

cta2ani.from(".txa-cta-2-item .has-ani-1", {
	y: -100,
	xPercent: -100,
	opacity: 0,
	duration: .4
},"<40%")


cta2ani.from(".txa-cta-2-item .has-ani-2", {
	xPercent: -100,
	opacity: 0,
	duration: .4
},"<40%")


cta2ani.from(".txa-cta-2-item .has-ani-3", {
	y: 100,
	xPercent: -100,
	opacity: 0,
	duration: .4
},"<40%")


cta2ani.from(".txa-cta-2-item .has-ani-4", {
	y: -100,
	xPercent: 100,
	opacity: 0,
	duration: .4
},"<40%")


cta2ani.from(".txa-cta-2-item .has-ani-5", {
	xPercent: 100,
	opacity: 0,
	duration: .4
},"<40%")

cta2ani.from(".txa-cta-2-item .has-ani-6", {
	y: 100,
	xPercent: 100,
	opacity: 0,
	duration: .4
},"<40%")



/* 
	showcase-3-svg
*/
if($(".txa-showcase-2-wrap-line").length) {
	const path = document.querySelector(".txa-showcase-2-wrap-line path");
	const pathLength = path.getTotalLength();
	
	path.style.strokeDasharray = pathLength;
	path.style.strokeDashoffset = pathLength;
	
	gsap.to(path, {
	  strokeDashoffset: 0,
	  duration: 2,
	  scrollTrigger: {
		trigger: ".txa-showcase-2-wrap-line",
		start: "top 80%",   
		end: "bottom 20%",  
		toggleActions: "play none none reverse",
	  }
	});
	
}

/* 
	showcase-3-img
*/
var showcase3img = gsap.timeline({
	scrollTrigger: {
		trigger: ".txa-showcase-3-right",
		toggleActions: "play none none reverse",
		start: "top 80%",
		markers: false,
	}
})

showcase3img.from(".txa-showcase-3-item", {
	yPercent: 100,
	opacity: 0,
	duration: .4,
	stagger: 0.1,
})



/* 
	contact-2-themes
*/
var showcase3img = gsap.timeline({
	scrollTrigger: {
		trigger: ".txa-contact-2-theme-ss",
		toggleActions: "play none none reverse",
		start: "top 90%",
		markers: false,
	}
})

showcase3img.from(".txa-contact-2-theme-ss .single-ss", {
	yPercent: 100,
	opacity: 0,
	duration: .4,
	stagger: 0.1,
})

/* 
	tooltip-active
*/
$(function () {


	$('[data-toggle="tooltip"]').tooltip();
})


/* 
	popup-2-activation
*/
document.addEventListener("DOMContentLoaded", function () {
	if($(".txa-popup-2-area").length) {
		const popup = document.querySelector(".txa-popup-2-area");
		setTimeout(() => {
			popup.classList.add("active");
		}, 3000);
	}

});

/* 
	popup-2-slider
*/
if ($('.txa_popup2_slider').length) {

    var txa_popup2_slider = new Swiper(".txa_popup2_slider", {
		direction: "vertical",
		loop: true,
		autoplay: {
			delay: 3000,
		},
	});
  
}

/* 
	popup-2-btn
*/
  
if($(".txa-popup-2-btn").length) {
	const buttons = document.querySelectorAll('.txa-popup-2-btn');
	const defaultActive = buttons[0]; 
	
	buttons.forEach(btn => {
		btn.addEventListener('mouseenter', function () {
			buttons.forEach(b => b.classList.remove('active'));
			this.classList.add('active');
		});
	
		btn.addEventListener('mouseleave', function () {
			buttons.forEach(b => b.classList.remove('active'));
			defaultActive.classList.add('active');
		});
	});
}


var designHubAni = gsap.timeline()
designHubAni.from(".txa-design-hub-2-bg-ss-2", {
	xPercent: -50,
	opacity: 0,
	duration: 1,
	ease: "power3.out",
})
designHubAni.from(".txa-design-hub-2-bg-ss-4", {
	xPercent: 50,
	opacity: 0,
	duration: 1,
	ease: "power3.out",
},"<")
designHubAni.from(".txa-design-hub-2-bg-ss-3", {
	xPercent: -50,
	opacity: 0,
	duration: 1,
	ease: "power3.out",
},"<30%")
designHubAni.from(".txa-design-hub-2-bg-ss-5", {
	xPercent: 50,
	opacity: 0,
	duration: 1,
	ease: "power3.out",
},"<30%")


})(jQuery);