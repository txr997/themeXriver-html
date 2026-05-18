/* 
	price-3-toggle-class
*/


// price toggle
if ($(".txa-price-4-toggle").length) {

    const $toggleWrap = $(".txa-price-4-toggle");
    const $toggleBtn = $(".txa-price-4-toggle-btn");

    // default yearly discount %
    const discountPercent = parseInt(
        $(".txa-price-4-toggle-save").text().match(/\d+/)[0]
    );

    // store original monthly prices
    $(".txa-price-4-card").each(function () {

        const $card = $(this);

        const monthlyPrice = parseFloat(
            $card.find(".price-amount").text()
        );

        $card.attr("data-monthly", monthlyPrice);

        // yearly price calculate
        const yearlyPrice = Math.round(
            (monthlyPrice * 12) * ((100 - discountPercent) / 100)
        );

        $card.attr("data-yearly", yearlyPrice);

    });

    // counter animation
    function animatePrice($el, start, end, duration = 800) {

        $({ countNum: start }).animate(
            { countNum: end },
            {
                duration: duration,
                easing: "swing",

                step: function () {
                    $el.text(Math.floor(this.countNum));
                },

                complete: function () {
                    $el.text(end);
                }
            }
        );

    }

    // update pricing
    function updatePricing(isYearly) {

        $(".txa-price-4-card").each(function () {

            const $card = $(this);

            const monthly = parseFloat($card.attr("data-monthly"));
            const yearly = parseFloat($card.attr("data-yearly"));

            const $price = $card.find(".price-amount");
            const currentPrice = parseFloat($price.text());

            const $period = $card.find(".price-period");

            const $saveBox = $card.find(".save-price-box");
            const $saveText = $card.find(".save-price span");

            if (isYearly) {

                // animate price
                animatePrice($price, currentPrice, yearly);

                // change text
                $period.text("/ Year");

                // yearly save calculation
                const originalYearly = monthly * 12;
                const savedAmount = Math.round(originalYearly - yearly);

                $saveText.text(`Save $${savedAmount}`);

                // show save box
                $saveBox.css("height", $saveBox.get(0).scrollHeight + "px");

            } else {

                // animate price
                animatePrice($price, currentPrice, monthly);

                // change text
                $period.text("/ Monthly");

                // hide save box
                $saveBox.css("height", "0px");

            }

        });

    }

    // click toggle
    $toggleBtn.on("click", function () {

        $(this).toggleClass("active");
        $toggleWrap.toggleClass("active");

        const isYearly = $(this).hasClass("active");

        updatePricing(isYearly);

    });

}

// progress animation
if ($(".assets-progress-line-bar").length) {

    const progressBars = gsap.utils.toArray(".assets-progress-line-bar");

    // store original width
    progressBars.forEach((bar) => {

        const targetWidth = bar.style.width;

        gsap.set(bar, {
            width: 0
        });

        bar.dataset.width = targetWidth;

    });

    // scroll animation
    ScrollTrigger.batch(progressBars, {
        start: "top 90%",

        onEnter: (bars) => {

            bars.forEach((bar, index) => {

                gsap.to(bar, {
                    width: bar.dataset.width,
                    duration: 1.4,
                    ease: "power3.out",
                    delay: index * 0.1
                });

            });

        }
    });

    // re animate on pricing toggle
    $(".txa-price-4-toggle-btn").on("click", function () {

        progressBars.forEach((bar, index) => {

            gsap.set(bar, {
                width: 0
            });

            gsap.to(bar, {
                width: bar.dataset.width,
                duration: 1.2,
                ease: "power3.out",
                delay: index * 0.08
            });

        });

    });

}

// floating svg dots animation
if ($(".bg-dot circle").length) {

    gsap.utils.toArray(".bg-dot circle").forEach((circle, i) => {

        // random start position
        const xMove = gsap.utils.random(-50, 50);
        const yMove = gsap.utils.random(-50, 50);
        const duration = gsap.utils.random(2, 5);
        const delay = gsap.utils.random(0, 2);

        gsap.to(circle, {
            x: xMove,
            y: yMove,
            opacity: gsap.utils.random(0.2, 1),
            duration: duration,
            delay: delay,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

    });

}