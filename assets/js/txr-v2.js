/* ==========================================================
   themeXriver v2 — shared page script
   Needs: gsap.min.js, ScrollTrigger.min.js
   (each feature checks for its own markup and skips if absent)
   ========================================================== */
(function () {
	'use strict';

	var doc = document.documentElement;
	doc.classList.add('txr-js');

	var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
	var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var finePointer = window.matchMedia('(pointer: fine)').matches;
	var hasGsap = !!(window.gsap && window.ScrollTrigger);
	var money = function (n) { return '$' + n.toLocaleString('en-US'); };

	function store(method, key, val) {
		try { return window.sessionStorage[method](key, val); } catch (e) { return null; }
	}

	if (hasGsap) gsap.registerPlugin(ScrollTrigger);

	/* ---------- anchor scroll (native) ---------- */
	function scrollToEl(el) {
		var off = -(parseInt(getComputedStyle(document.body).getPropertyValue('--txr-header-h'), 10) || 80) - 20;
		window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset + off, behavior: reduce ? 'auto' : 'smooth' });
	}
	$$('a[href^="#"]').forEach(function (a) {
		a.addEventListener('click', function (e) {
			var id = a.getAttribute('href');
			if (id.length < 2) return;
			var target = document.querySelector(id);
			if (!target) return;
			e.preventDefault();
			scrollToEl(target);
		});
	});

	/* ---------- announcement ---------- */
	var announce = $('.txr-announce');
	if (announce) {
		if (store('getItem', 'txr-announce') === 'closed') announce.classList.add('is-closed');
		var ac = $('.txr-announce__close', announce);
		if (ac) ac.addEventListener('click', function () {
			announce.classList.add('is-closed');
			store('setItem', 'txr-announce', 'closed');
			if (hasGsap) ScrollTrigger.refresh();
		});
	}

	/* ---------- header + back to top + read bar ---------- */
	var header = $('.txr-header');
	var toTop = $('.txr-totop');
	var ring = toTop ? $('circle', toTop) : null;
	var readbar = $('.txr-readbar');
	var buybar = $('.txr-buybar');
	var lastY = 0;
	var maxScroll = 0;
	var ticking = false;
	var art = $('.txr-prose');
	function measure() { maxScroll = document.documentElement.scrollHeight - window.innerHeight; }
	measure();
	window.addEventListener('resize', measure);
	window.addEventListener('load', measure);
	if (hasGsap) ScrollTrigger.addEventListener('refresh', measure);
	function onScroll() {
		var y = window.pageYOffset;
		var max = maxScroll;
		var p = max > 0 ? y / max : 0;
		if (header) {
			header.classList.toggle('is-scrolled', y > 10);
			var anyOpen = header.querySelector('.txr-nav__item:hover');
			header.classList.toggle('is-hidden', y > lastY && y > 500 && !anyOpen);
		}
		if (toTop) {
			toTop.classList.toggle('is-show', y > 700);
			if (ring) ring.style.strokeDashoffset = 145 - 145 * p;
		}
		if (readbar) {
			if (art) {
				var r = art.getBoundingClientRect();
				var ap = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight * 0.6)));
				readbar.style.transform = 'scaleX(' + ap + ')';
			}
		}
		if (buybar) buybar.classList.toggle('is-show', y > 700 && (max - y) > 400);
		lastY = y;
		ticking = false;
	}
	// run at most once per frame
	window.addEventListener('scroll', function () {
		if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
	}, { passive: true });
	onScroll();

	/* ---------- pause looping animations while off screen ---------- */
	if ('IntersectionObserver' in window) {
		var loopIo = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) { en.target.classList.toggle('is-paused', !en.isIntersecting); });
		}, { rootMargin: '100px 0px' });
		$$('.txr-hero__ripples, .txr-wall, .txr-marquee, .txr-reviews').forEach(function (el) { loopIo.observe(el); });
	}
	if (toTop) toTop.addEventListener('click', function () {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	});

	/* ---------- mobile nav ---------- */
	var mnav = $('.txr-mnav');
	function setMnav(open) {
		if (!mnav) return;
		mnav.classList.toggle('is-open', open);
		document.body.style.overflow = open ? 'hidden' : '';	}
	$$('[data-txr-mnav-open]').forEach(function (b) { b.addEventListener('click', function () { setMnav(true); }); });
	$$('[data-txr-mnav-close]').forEach(function (b) { b.addEventListener('click', function () { setMnav(false); }); });
	$$('.txr-mnav__link[aria-expanded]').forEach(function (b) {
		b.addEventListener('click', function () {
			b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
		});
	});

	/* ---------- search overlay ---------- */
	var search = $('.txr-search');
	function setSearch(open) {
		if (!search) return;
		search.classList.toggle('is-open', open);
		if (open) setTimeout(function () { var i = $('input', search); if (i) i.focus(); }, 120);
	}
	$$('[data-txr-search-open]').forEach(function (b) { b.addEventListener('click', function () { setSearch(true); }); });
	if (search) search.addEventListener('click', function (e) { if (e.target === search) setSearch(false); });
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { setSearch(false); setMnav(false); closeFilters(); }
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && search) { e.preventDefault(); setSearch(true); }
	});

	/* ---------- cart (demo counter + toast) ---------- */
	var toast = document.createElement('div');
	toast.className = 'txr-toast';
	toast.setAttribute('role', 'status');
	toast.innerHTML = '<svg class="txr-i"><use href="#i-check"></use></svg><span></span>';
	document.body.appendChild(toast);
	var toastTimer;
	function showToast(msg) {
		$('span', toast).textContent = msg;
		toast.classList.add('is-show');
		clearTimeout(toastTimer);
		toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 2600);
	}
	document.addEventListener('click', function (e) {
		var btn = e.target.closest('[data-txr-cart]');
		if (!btn) return;
		e.preventDefault();
		$$('.txr-header__count').forEach(function (c) {
			c.textContent = (parseInt(c.textContent, 10) || 0) + 1;
			c.classList.remove('is-bump'); void c.offsetWidth; c.classList.add('is-bump');
		});
		showToast((btn.getAttribute('data-txr-cart') || 'Item') + ' added to your cart');
	});

	/* ---------- copy buttons ---------- */
	$$('[data-txr-copy]').forEach(function (b) {
		b.addEventListener('click', function () {
			var text = b.getAttribute('data-txr-copy') || window.location.href;
			var done = function () { showToast('Copied to clipboard'); };
			if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
		});
	});

	/* ---------- accordion ---------- */
	$$('.txr-acc').forEach(function (acc) {
		$$('.txr-acc__btn', acc).forEach(function (btn) {
			btn.addEventListener('click', function () {
				var item = btn.closest('.txr-acc__item');
				var open = !item.classList.contains('is-open');
				$$('.txr-acc__item', acc).forEach(function (i) {
					i.classList.remove('is-open');
					$('.txr-acc__btn', i).setAttribute('aria-expanded', 'false');
				});
				item.classList.toggle('is-open', open);
				btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
		});
	});

	/* ---------- filter tabs (home grid, services grid, blog) ---------- */
	$$('[data-txr-filter]').forEach(function (group) {
		var target = document.querySelector(group.getAttribute('data-txr-filter'));
		if (!target) return;
		$$('button', group).forEach(function (btn) {
			btn.addEventListener('click', function () {
				$$('button', group).forEach(function (b) { b.classList.remove('is-active'); });
				btn.classList.add('is-active');
				var f = btn.getAttribute('data-filter');
				var shown = [];
				Array.prototype.forEach.call(target.children, function (item) {
					var cats = (item.getAttribute('data-cat') || '').split(' ');
					var show = f === 'all' || cats.indexOf(f) > -1;
					item.classList.toggle('is-out', !show);
					if (show) shown.push(item);
				});
				if (hasGsap && !reduce) gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', overwrite: true });
				if (hasGsap) ScrollTrigger.refresh();
			});
		});
	});

	/* ---------- themes listing: filter / search / sort ---------- */
	var shopGrid = $('[data-txr-shop]');
	var filtersEl = $('.txr-filters');
	function closeFilters() { if (filtersEl) filtersEl.classList.remove('is-open'); }
	if (filtersEl) {
		$$('[data-txr-filters-open]').forEach(function (b) { b.addEventListener('click', function () { filtersEl.classList.add('is-open'); }); });
		$$('[data-txr-filters-close]').forEach(function (b) { b.addEventListener('click', closeFilters); });
	}
	if (shopGrid) {
		var cards = $$('.txr-tcard', shopGrid);
		var countEl = $('[data-txr-count-out]');
		var emptyEl = $('.txr-empty');
		var qInput = $('[data-txr-shop-search]');
		var sortSel = $('[data-txr-sort]');
		var bundle = $('.txr-bundle', shopGrid);
		// show 20 matching cards at a time; "load more" reveals the next 20
		var PER_PAGE = 20, limit = PER_PAGE;
		var moreWrap = $('[data-txr-loadmore]');
		var paginate = function () {
			var i = 0;
			$$('.txr-tcard', shopGrid).forEach(function (c) {
				var hide = !c.classList.contains('is-out') && i++ >= limit;
				c.classList.toggle('is-more', hide);
			});
			if (moreWrap) moreWrap.hidden = i <= limit;
		};
		if (moreWrap) $('button', moreWrap).addEventListener('click', function () {
			limit += PER_PAGE;
			paginate();
			if (hasGsap) ScrollTrigger.refresh();
		});
		var checked = function (name) { return $$('input[name="' + name + '"]:checked').map(function (i) { return i.value; }); };
		var applyShop = function () {
			var plats = checked('platform'), cats = checked('category');
			var priceSel = $('input[name="price"]:checked');
			var price = priceSel ? priceSel.value : 'all';
			var colSel = $('input[name="collection"]:checked');
			var col = colSel ? colSel.value : 'all';
			var q = qInput ? qInput.value.trim().toLowerCase() : '';
			var n = 0;
			cards.forEach(function (c) {
				var p = parseFloat(c.getAttribute('data-price'));
				var ok = (col === 'all' || (c.getAttribute('data-collection') || '').split(' ').indexOf(col) > -1) &&
					(!plats.length || plats.some(function (v) { return (c.getAttribute('data-platform') || '').indexOf(v) > -1; })) &&
					(!cats.length || cats.indexOf(c.getAttribute('data-cat')) > -1) &&
					(price === 'all' || (price === 'u30' && p < 30) || (price === '30-50' && p >= 30 && p <= 50) || (price === 'o50' && p > 50)) &&
					(!q || (c.getAttribute('data-name') + ' ' + c.textContent).toLowerCase().indexOf(q) > -1);
				c.classList.toggle('is-out', !ok);
				if (ok) n++;
			});
			if (countEl) countEl.textContent = n;
			if (emptyEl) emptyEl.classList.toggle('is-show', n === 0);
			if (bundle) bundle.style.display = n > 6 ? '' : 'none';
			limit = PER_PAGE;
			paginate();
			if (hasGsap) ScrollTrigger.refresh();
		};
		var applySort = function () {
			var v = sortSel.value;
			var key = { popular: 'data-sales', newest: 'data-date', low: 'data-price', high: 'data-price', rating: 'data-rating' }[v];
			var sorted = cards.slice().sort(function (a, b) {
				var x = parseFloat(a.getAttribute(key)), y = parseFloat(b.getAttribute(key));
				return v === 'low' ? x - y : y - x;
			});
			sorted.forEach(function (c, i) {
				shopGrid.appendChild(c);
				if (i === 5 && bundle) shopGrid.appendChild(bundle);
			});
			limit = PER_PAGE;
			paginate();
		};
		$$('.txr-filters input').forEach(function (i) { i.addEventListener('change', applyShop); });
		if (qInput) qInput.addEventListener('input', applyShop);
		if (sortSel) sortSel.addEventListener('change', applySort);
		// Nice Select fires change through jQuery, which skips native listeners
		if (sortSel && window.jQuery) jQuery(sortSel).on('change', applySort);
		$$('[data-txr-filters-reset]').forEach(function (b) {
			b.addEventListener('click', function () {
				$$('.txr-filters input[type="checkbox"]').forEach(function (i) { i.checked = false; });
				var all = $('.txr-filters input[name="price"][value="all"]'); if (all) all.checked = true;
				var allCol = $('.txr-filters input[name="collection"][value="all"]'); if (allCol) allCol.checked = true;
				if (qInput) qInput.value = '';
				applyShop();
			});
		});
		var params = new URLSearchParams(window.location.search);
		if (params.get('q') && qInput) qInput.value = params.get('q');
		if (params.get('cat')) { var ci = $('.txr-filters input[value="' + params.get('cat') + '"]'); if (ci) ci.checked = true; }
		applyShop();
	}

	/* ---------- theme details: gallery, license, add-ons, tabs ---------- */
	var screen = $('.txr-browser__screen[data-txr-gallery]');
	if (screen) {
		var mainImg = $('img', screen);
		$$('.txr-thumbs button').forEach(function (b) {
			b.addEventListener('click', function () {
				$$('.txr-thumbs button').forEach(function (x) { x.classList.remove('is-active'); });
				b.classList.add('is-active');
				screen.classList.add('is-switching');
				setTimeout(function () {
					mainImg.src = b.getAttribute('data-src');
					mainImg.alt = b.getAttribute('data-alt') || mainImg.alt;
					screen.classList.remove('is-switching');
				}, 250);
			});
		});
	}
	var buy = $('.txr-buy');
	// live total only when the box offers license / add-on choices; otherwise the price is static
	if (buy && $('input[name="license"]', buy)) {
		var totalEls = $$('[data-txr-total]');
		var oldEl = $('[data-txr-old]', buy);
		var calc = function () {
			var lic = $('input[name="license"]:checked', buy);
			var sum = lic ? parseFloat(lic.value) : 0;
			var old = lic ? parseFloat(lic.getAttribute('data-old')) : 0;
			$$('input[name="addon"]:checked', buy).forEach(function (a) { sum += parseFloat(a.value); old += parseFloat(a.value); });
			totalEls.forEach(function (t) { t.textContent = money(sum); });
			if (oldEl) oldEl.textContent = money(old);
		};
		$$('input', buy).forEach(function (i) { i.addEventListener('change', calc); });
		calc();
	}
	// "show more" toggles: the button opens the [data-txr-more-box] just before it
	$$('[data-txr-more]').forEach(function (btn) {
		var box = btn.previousElementSibling;
		while (box && !box.hasAttribute('data-txr-more-box')) box = box.previousElementSibling;
		if (!box) return;
		var label = $('span', btn), timer;
		btn.addEventListener('click', function () {
			var open = !box.classList.contains('is-open');
			box.classList.toggle('is-open', open);
			btn.classList.toggle('is-open', open);
			if (label) label.textContent = btn.getAttribute(open ? 'data-less' : 'data-more');
			clearTimeout(timer);
			box.classList.remove('is-done');
			if (open) timer = setTimeout(function () { box.classList.add('is-done'); }, 600);
		});
	});

	// small sidebar sliders: arrows, dots and optional autoplay
	$$('[data-txr-sslider]').forEach(function (sl) {
		var slides = $$('.txr-sslider__slide', sl);
		if (slides.length < 2) return;
		var dotsBox = $('[data-dots]', sl), dots = [], cur = 0, auto = parseInt(sl.getAttribute('data-autoplay') || '0', 10), tick;
		var go = function (n) {
			cur = (n + slides.length) % slides.length;
			slides.forEach(function (s, i) { s.classList.toggle('is-active', i === cur); });
			dots.forEach(function (d, i) { d.classList.toggle('is-active', i === cur); });
		};
		if (dotsBox) {
			slides.forEach(function (s, i) {
				var d = document.createElement('button');
				d.type = 'button';
				d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
				d.addEventListener('click', function () { go(i); restart(); });
				dotsBox.appendChild(d);
				dots.push(d);
			});
		}
		var restart = function () {
			clearInterval(tick);
			if (auto && !reduce) tick = setInterval(function () { go(cur + 1); }, auto);
		};
		var prev = $('[data-prev]', sl), next = $('[data-next]', sl);
		if (prev) prev.addEventListener('click', function () { go(cur - 1); restart(); });
		if (next) next.addEventListener('click', function () { go(cur + 1); restart(); });
		sl.addEventListener('mouseenter', function () { clearInterval(tick); });
		sl.addEventListener('mouseleave', restart);
		go(0);
		restart();
	});

	var pdtabs = $('.txr-pdtabs');
	if (pdtabs && 'IntersectionObserver' in window) {
		var tabLinks = $$('a', pdtabs);
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				tabLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
			});
		}, { rootMargin: '-35% 0px -60% 0px' });
		tabLinks.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) io.observe(s); });
	}

	/* ---------- help center: live question search (works with the category tabs) ---------- */
	var faqSearch = $('[data-txr-faq-search]');
	var faqList = $('#txr-faq-list');
	if (faqSearch && faqList) {
		var faqItems = $$('.txr-acc__item', faqList);
		var faqCount = $('[data-txr-faq-count]');
		var faqEmpty = $('[data-txr-faq-empty]');
		var runFaq = function () {
			var q = faqSearch.value.trim().toLowerCase();
			faqItems.forEach(function (it) {
				it.classList.toggle('is-miss', !!q && it.textContent.toLowerCase().indexOf(q) === -1);
			});
			var visible = faqItems.filter(function (it) { return !it.classList.contains('is-miss') && !it.classList.contains('is-out'); }).length;
			if (faqCount) faqCount.textContent = q ? visible + ' found' : '';
			if (faqEmpty) faqEmpty.hidden = visible > 0;
		};
		faqSearch.addEventListener('input', runFaq);
		// tabs change .is-out, so re-check the empty state after a tab click
		$$('[data-txr-filter="#txr-faq-list"] button').forEach(function (b) { b.addEventListener('click', function () { setTimeout(runFaq, 0); }); });
		// ?q= from the support page search
		var qParam = new URLSearchParams(location.search).get('q');
		if (qParam) { faqSearch.value = qParam; runFaq(); }
	}

	/* ---------- affiliate earnings calculator ---------- */
	$$('[data-txr-afcalc]').forEach(function (calc) {
		var sales = $('[data-in="sales"]', calc), rate = $('[data-in="rate"]', calc);
		var out = function (k) { return $('[data-out="' + k + '"]', calc); };
		var fill = function (r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); };
		var update = function () {
			var month = Math.round(sales.value * 59 * rate.value / 100);
			out('sales').textContent = sales.value;
			out('rate').textContent = rate.value + '%';
			out('month').textContent = money(month).replace(/\.00$/, '');
			out('year').textContent = money(month * 12).replace(/\.00$/, '');
			fill(sales); fill(rate);
		};
		sales.addEventListener('input', update);
		rate.addEventListener('input', update);
		update();
	});

	/* ---------- lightbox for [data-txr-lightbox] galleries (links to full images) ---------- */
	$$('[data-txr-lightbox]').forEach(function (gal) {
		var links = $$('a[href]', gal);
		if (!links.length) return;
		var box = document.createElement('div');
		box.className = 'txr-lbox';
		box.setAttribute('role', 'dialog');
		box.setAttribute('aria-modal', 'true');
		box.setAttribute('aria-label', 'Image viewer');
		box.innerHTML = '<span class="txr-lbox__count"></span>' +
			'<figure class="txr-lbox__fig"><div class="txr-lbox__img wa-img-auto"><img alt=""></div><figcaption class="txr-lbox__cap"></figcaption></figure>' +
			'<button type="button" class="txr-lbox__btn txr-lbox__btn--close" aria-label="Close"><svg class="txr-i" aria-hidden="true"><use href="#i-close"></use></svg></button>' +
			'<button type="button" class="txr-lbox__btn txr-lbox__btn--prev" aria-label="Previous image"><svg class="txr-i" aria-hidden="true"><use href="#i-arrow-left"></use></svg></button>' +
			'<button type="button" class="txr-lbox__btn txr-lbox__btn--next" aria-label="Next image"><svg class="txr-i" aria-hidden="true"><use href="#i-arrow-right"></use></svg></button>';
		document.body.appendChild(box);
		var img = $('img', box), cap = $('.txr-lbox__cap', box), count = $('.txr-lbox__count', box), cur = 0, lastFocus;
		var show = function (i) {
			cur = (i + links.length) % links.length;
			var l = links[cur];
			img.src = l.getAttribute('href');
			img.alt = ($('img', l) || {}).alt || '';
			cap.textContent = l.getAttribute('data-caption') || '';
			count.textContent = (cur + 1) + ' / ' + links.length;
		};
		var open = function (i) {
			lastFocus = document.activeElement;
			show(i);
			box.classList.add('is-open');
			document.body.style.overflow = 'hidden';
			$('.txr-lbox__btn--close', box).focus();
		};
		var close = function () {
			box.classList.remove('is-open');
			document.body.style.overflow = '';
			if (lastFocus) lastFocus.focus();
		};
		links.forEach(function (l, i) {
			l.addEventListener('click', function (e) { e.preventDefault(); open(i); });
		});
		$('.txr-lbox__btn--close', box).addEventListener('click', close);
		$('.txr-lbox__btn--prev', box).addEventListener('click', function () { show(cur - 1); });
		$('.txr-lbox__btn--next', box).addEventListener('click', function () { show(cur + 1); });
		box.addEventListener('click', function (e) { if (e.target === box) close(); });
		document.addEventListener('keydown', function (e) {
			if (!box.classList.contains('is-open')) return;
			if (e.key === 'Escape') close();
			if (e.key === 'ArrowLeft') show(cur - 1);
			if (e.key === 'ArrowRight') show(cur + 1);
		});
		// swipe on touch screens
		var sx = null;
		box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
		box.addEventListener('touchend', function (e) {
			if (sx === null) return;
			var dx = e.changedTouches[0].clientX - sx;
			if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
			sx = null;
		});
	});

	/* ---------- All Access: yearly / lifetime price toggle ---------- */
	$$('[data-txr-bill]').forEach(function (bill) {
		var target = $('[data-txr-bill-target]');
		if (!target) return;
		var btns = $$('button', bill);
		btns.forEach(function (b) {
			b.addEventListener('click', function () {
				var mode = b.getAttribute('data-bill');
				btns.forEach(function (x) { x.classList.toggle('is-active', x === b); });
				$$('.txr-pkg__price', target).forEach(function (p) {
					p.classList.add('is-swapping');
					setTimeout(function () {
						$$('[data-y]', p).forEach(function (el) { el.textContent = el.getAttribute('data-' + mode); });
						p.classList.remove('is-swapping');
					}, 220);
				});
			});
		});
	});

	/* ---------- article tables: wrap bare <table>s so they scroll on small screens ---------- */
	$$('.txr-prose table').forEach(function (t) {
		if (t.parentElement.classList.contains('txr-prose__table')) return;
		var wrap = document.createElement('div');
		wrap.className = 'txr-prose__table';
		t.parentNode.insertBefore(wrap, t);
		wrap.appendChild(t);
	});

	/* ---------- blog TOC active state ---------- */
	var toc = $('.txr-toc');
	if (toc && 'IntersectionObserver' in window) {
		var tocLinks = $$('a', toc);
		var tio = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (!en.isIntersecting) return;
				tocLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
			});
		}, { rootMargin: '-20% 0px -70% 0px' });
		tocLinks.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) tio.observe(s); });
	}

	/* ---------- services estimator ---------- */
	var est = $('[data-txr-est]');
	if (est) {
		var picked = $('.txr-est__picked', est);
		var totalOut = $('[data-txr-est-total]', est);
		var daysOut = $('[data-txr-est-days]', est);
		var estCalc = function () {
			var items = $$('input:checked', est);
			var sum = 0, days = 0;
			picked.innerHTML = '';
			items.forEach(function (i) {
				sum += parseFloat(i.value);
				days = Math.max(days, parseFloat(i.getAttribute('data-days')));
				var li = document.createElement('li');
				li.innerHTML = '<span></span><span>' + money(parseFloat(i.value)) + '</span>';
				li.firstChild.textContent = i.getAttribute('data-name');
				picked.appendChild(li);
			});
			// parallel work: add one day per extra service
			if (items.length > 1) days += items.length - 1;
			if (!items.length) picked.innerHTML = '<li class="txr-est__picked-empty">Pick one or more services to see your estimate.</li>';
			totalOut.textContent = money(sum);
			daysOut.textContent = items.length ? days + (days === 1 ? ' day' : ' days') : '—';
		};
		$$('input', est).forEach(function (i) { i.addEventListener('change', estCalc); });
		estCalc();
		var sendBtn = $('[data-txr-est-send]', est);
		var msg = $('#txr-quote-msg');
		if (sendBtn && msg) sendBtn.addEventListener('click', function (e) {
			var names = $$('input:checked', est).map(function (i) { return '• ' + i.getAttribute('data-name'); });
			if (names.length) msg.value = 'Hi themeXriver team, I would like a quote for:\n' + names.join('\n') + '\n\nEstimated total: ' + totalOut.textContent + '\n\nAbout my project: ';
			e.preventDefault();
			scrollToEl($('#quote'));
			setTimeout(function () { msg.focus(); }, 900);
		});
	}

	/* ---------- All Access switch ---------- */
	$$('[data-txr-plan]').forEach(function (wrap) {
		var out = $('[data-txr-plan-price]', wrap), per = $('[data-txr-plan-per]', wrap), old = $('[data-txr-plan-old]', wrap), save = $('[data-txr-plan-save]', wrap);
		$$('.txr-access__switch button', wrap).forEach(function (b) {
			b.addEventListener('click', function () {
				$$('.txr-access__switch button', wrap).forEach(function (x) { x.classList.remove('is-active'); });
				b.classList.add('is-active');
				out.textContent = b.getAttribute('data-price');
				per.textContent = b.getAttribute('data-per');
				old.textContent = b.getAttribute('data-old');
				save.textContent = b.getAttribute('data-save');
				if (hasGsap && !reduce) gsap.fromTo(out, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
			});
		});
	});

	/* ---------- custom dropdowns (jQuery Nice Select, loaded only where needed) ---------- */
	if (window.jQuery && jQuery.fn.niceSelect) jQuery('select[data-txr-nice]').niceSelect();

	/* ---------- hero search: typing placeholder ---------- */
	var typeInput = $('[data-txr-type]');
	if (typeInput && !reduce) {
		var words = typeInput.getAttribute('data-txr-type').split('|');
		var wi = 0, ci = 0, del = false;
		(function tick() {
			if (document.activeElement === typeInput || typeInput.value) { setTimeout(tick, 600); return; }
			var w = words[wi];
			ci += del ? -1 : 1;
			typeInput.setAttribute('placeholder', w.slice(0, ci) + (ci % 2 ? '|' : ''));
			var wait = del ? 35 : 75;
			if (!del && ci === w.length) { del = true; wait = 1600; }
			else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; wait = 300; }
			setTimeout(tick, wait);
		})();
	}

	/* ===================== testimonial circle (avatar ring + quote slider) ===================== */
	var t1Preview = $('.nm_t1_preview_slider_active');
	if (t1Preview && window.Swiper) {
		// virtualTranslate: Swiper never moves the ring wrapper, so the scroll rotation owns its transform
		var t1Thumbs = new Swiper(t1Preview, { speed: 500, slidesPerView: 'auto', allowTouchMove: false, virtualTranslate: true, watchSlidesProgress: true });
		new Swiper('.nm_t1_main_slider_active', {
			speed: 600,
			effect: 'fade',
			allowTouchMove: false,
			loop: false,
			rewind: true,
			fadeEffect: { crossFade: true },
			autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
			navigation: { nextEl: '.kk_t1_next', prevEl: '.kk_t1_prev' },
			thumbs: { swiper: t1Thumbs }
		});
		// lay the avatar slides out on a circle that follows the ring size
		var t1Wrap = $('.swiper-wrapper', t1Preview);
		var t1Slides = $$('.swiper-slide', t1Preview);
		var t1Layout = function () {
			var w = t1Wrap.clientWidth, step = (2 * Math.PI) / t1Slides.length;
			t1Slides.forEach(function (slide, i) {
				var s = slide.clientWidth, r = w / 2 - s / 2 - 4, ang = i * step - Math.PI / 2;
				slide.style.left = (w / 2 + r * Math.cos(ang) - s / 2) + 'px';
				slide.style.top = (w / 2 + r * Math.sin(ang) - s / 2) + 'px';
			});
		};
		t1Layout();
		window.addEventListener('resize', t1Layout);
	}

	/* ===================== animations ===================== */
	if (!hasGsap || reduce) {
		$$('[data-txr-reveal]').forEach(function (el) { el.classList.add('is-revealed'); });
		$$('.txr-gauge, .txr-rsum, .txr-stats').forEach(function (el) { el.classList.add('is-in'); });
		return;
	}

	// split headline into words
	function splitWords(el) {
		var html = '';
		Array.prototype.forEach.call(el.childNodes, function (node) {
			if (node.nodeType === 3) {
				node.textContent.split(/(\s+)/).forEach(function (part) {
					if (!part) return;
					html += /^\s+$/.test(part) ? ' ' : '<span class="txr-w"><span>' + part + '</span></span>';
				});
			} else if (node.nodeType === 1) {
				html += node.tagName === 'BR' ? '<br>' : '<span class="txr-w"><span>' + node.outerHTML + '</span></span>';
			}
		});
		el.innerHTML = html;
		return $$('.txr-w > span', el);
	}
	$$('[data-txr-split]').forEach(function (el) {
		var w = splitWords(el);
		gsap.to(w, {
			y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.06, delay: 0.15,
			scrollTrigger: el.hasAttribute('data-txr-split-scroll') ? { trigger: el, start: 'top 85%' } : null
		});
	});

	// fade-up reveals
	ScrollTrigger.batch('[data-txr-reveal]', {
		start: 'top 90%',
		once: true,
		onEnter: function (batch) {
			gsap.to(batch, {
				opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09, overwrite: true,
				// hand the element back to CSS so its own hover transforms work again
				onComplete: function () {
					batch.forEach(function (el) { el.classList.add('is-revealed'); });
					gsap.set(batch, { clearProps: 'opacity,transform' });
				}
			});
		}
	});

	// counters
	$$('[data-txr-count]').forEach(function (el) {
		var end = parseFloat(el.getAttribute('data-txr-count'));
		var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
		var suf = el.getAttribute('data-suffix') || '';
		var obj = { v: 0 };
		el.textContent = (0).toFixed(dec) + suf;
		gsap.to(obj, {
			v: end, duration: 2.2, ease: 'power2.out',
			scrollTrigger: { trigger: el, start: 'top 90%', once: true },
			onUpdate: function () { el.textContent = (dec ? obj.v.toFixed(dec) : Math.round(obj.v).toLocaleString('en-US')) + suf; }
		});
	});

	// gauge + rating bars
	$$('.txr-gauge, .txr-rsum, .txr-stats').forEach(function (el) {
		ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () { el.classList.add('is-in'); } });
	});

	// gentle scroll parallax (category card screenshots)
	$$('[data-txr-parallax]').forEach(function (el) {
		// small range, so the shots never drift up into the card text
		gsap.fromTo(el, { y: 12 }, {
			y: -10, ease: 'none',
			scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
		});
	});

	// hero theme wall: tilted plane flattens while scrolling + pointer parallax
	var plane = $('.txr-wall__plane');
	if (plane) {
		gsap.fromTo(plane, { rotateX: 32, scale: 0.94, y: 0 }, {
			rotateX: 0, scale: 1.04, y: -60, ease: 'none',
			scrollTrigger: { trigger: '.txr-wall', start: 'top 85%', end: 'bottom top', scrub: 1 }
		});
		if (finePointer) {
			var wall = $('.txr-wall');
			// plain tweens instead of gsap.quickTo: the plane's transform is also driven by the
			// scroll scrub above, which sends quickTo's resetTo into infinite recursion
			var tilt = function (nx) {
				gsap.to(plane, { rotateZ: nx * -3, x: nx * -40, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
			};
			wall.addEventListener('pointermove', function (e) {
				var r = wall.getBoundingClientRect();
				tilt((e.clientX - r.left) / r.width - 0.5);
			});
			wall.addEventListener('pointerleave', function () { tilt(0); });
		}
		gsap.from('.txr-wall__chip', { opacity: 0, scale: 0.8, y: 30, duration: 1, ease: 'back.out(1.6)', stagger: 0.15, delay: 0.9 });
	}

	// pinned horizontal best-sellers rail (desktop only)
	var hs = $('[data-txr-hscroll]');
	if (hs) {
		var mm = gsap.matchMedia();
		mm.add('(min-width: 992px)', function () {
			var track = $('.txr-hs__track', hs);
			var bar = $('.txr-hs__progress span', hs);
			var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
			gsap.to(track, {
				x: function () { return -dist(); },
				ease: 'none',
				scrollTrigger: {
					trigger: hs,
					start: 'top top',
					end: function () { return '+=' + dist(); },
					pin: true,
					scrub: 1,
					invalidateOnRefresh: true,
					onUpdate: function (self) { if (bar) bar.style.transform = 'scaleX(' + self.progress + ')'; }
				}
			});
			// cards tilt in as they travel
			$$('.txr-hs__card', hs).forEach(function (card) {
				gsap.fromTo(card, { rotate: 4, y: 40 }, {
					rotate: 0, y: 0, ease: 'none',
					scrollTrigger: { trigger: hs, start: 'top top', end: function () { return '+=' + dist(); }, scrub: true }
				});
			});
		});
	}

	// manifesto words light up with scroll
	$$('[data-txr-scrub]').forEach(function (el) {
		var w = splitWords(el);
		gsap.set(w, { y: 0 });
		gsap.fromTo($$('.txr-w', el), { opacity: 0.14 }, {
			opacity: 1, stagger: 0.1, ease: 'none',
			scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true }
		});
	});

	// process line draws as you scroll, steps light up
	var proc = $('.txr-process__steps');
	if (proc) {
		gsap.to('.txr-process__line span', {
			scaleY: 1, ease: 'none',
			scrollTrigger: { trigger: proc, start: 'top 65%', end: 'bottom 65%', scrub: true }
		});
		$$('.txr-process__step', proc).forEach(function (s) {
			ScrollTrigger.create({ trigger: s, start: 'top 65%', end: 'bottom 65%', toggleClass: { targets: s, className: 'is-active' } });
		});
	}

	// magnetic CTAs
	if (finePointer) {
		// primary buttons keep only their color-swap hover, so no magnetic pull on them
		$$('[data-txr-magnetic]:not(.txr-btn--primary)').forEach(function (el) {
			// plain tweens (not quickTo), so other transform tweens on the element can't break it
			var pull = function (x, y) {
				gsap.to(el, { x: x, y: y, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
			};
			el.addEventListener('pointermove', function (e) {
				var r = el.getBoundingClientRect();
				pull((e.clientX - r.left - r.width / 2) * 0.3, (e.clientY - r.top - r.height / 2) * 0.3);
			});
			el.addEventListener('pointerleave', function () { pull(0, 0); });
		});
	}

	// testimonial avatar circle turns with scroll
	if (t1Preview) {
		gsap.fromTo($('.swiper-wrapper', t1Preview), { rotation: 40 }, {
			rotation: -40,
			scrollTrigger: { trigger: t1Preview, toggleActions: 'play none none reverse', scrub: 1 }
		});
	}

	window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
