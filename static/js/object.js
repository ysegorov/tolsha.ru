
(function () {

    'use strict';

    var root = this,
        doc = root.document;

    var object = doc.querySelector('.object'),
        cards = object && object.querySelector('.object-cards'),
        card = cards && cards.querySelector('.object-card'),
        cardZoom = cards && cards.querySelector('.object-card-zoom'),
        nav = doc.querySelector('.object-cards-nav'),
        items = nav && nav.querySelectorAll('.object-card-link') || [],
        largeImg = object && object.querySelector('.object-image'),
        largeImgZoom = object && object.querySelector('.object-image-zoom'),
        carousel = object && object.querySelector('.object-carousel'),
        next = carousel && carousel.querySelector('.object-carousel-next'),
        prev = carousel && carousel.querySelector('.object-carousel-prev'),
        close = carousel && carousel.querySelector('.object-carousel-close'),
        carouselVisible = false,
        pos = 0,
        last = items.length - 1,
        zoomImg;

    if (!cards) {
        return ;
    }

    function throttle(fn, delay) {
        var lastRun;
        return function throttled() {
            var time = (new Date()).getTime();
            if (!lastRun || (time - lastRun >= delay)) {
                fn.apply(null, arguments);
                lastRun = (new Date()).getTime();
            }
        }
    }

    function unhideLargeImg() {
        largeImg.style.opacity = 1;
    }

    function loadMediumCard(evt) {
        var selector = '.object-card-link',
            target = evt && evt.target,
            link = target && (target.matches(selector) ? target : target.closest(selector)),
            href = link && link.href,
            idx = link && link.dataset.pos;

        if (!link) {
            return ;
        }

        card.style.backgroundImage = 'url(' + href + ')';
        if (card.scrollIntoView) {
            card.scrollIntoView(false);
        }
        pos = parseInt(idx, 10);

        if (evt) {
            evt.preventDefault();
        }
        setLargeImg(link);
        openCarousel(evt);
    }

    function setLargeImg(link) {
        var width = link && parseInt(link.dataset.largeWidth, 10),
            height = link && parseInt(link.dataset.largeHeight, 10),
            isVertical = link && height > width,
            parent = largeImg.parentElement,
            parentRect = parent && parent.getBoundingClientRect(),
            parentW = parent && parentRect.width - 200,
            parentH = parent && parentRect.height - 40,
            ratioH,
            ratioW;

        largeImg.style.backgroundImage = largeImgZoom.style.backgroundImage = 'url(' + link.href.replace('medium', 'large') + ')';

        if (width > parentW || height > parentH) {
            ratioH = parentH / height;
            ratioW = parentW / width;
            if (ratioH < ratioW) {
                height = parentH;
                width = width * ratioH;
            } else {
                width = parentW;
                height = height * ratioW;
            }
        }
        largeImg.style.width = largeImgZoom.style.width = Math.floor(width) + 'px';
        largeImg.style.height = largeImgZoom.style.height = Math.floor(height) + 'px';
    }

    function navigate(delta) {
        var el;
        pos += delta;
        pos = pos > last ? 0 : pos < 0 ? last : pos;
        el = items[pos];
        if (el) {
            setLargeImg(el);
        }
    }

    function closeCarousel(evt) {
        evt.preventDefault();
        carousel.classList.remove('active');
        doc.body.classList.remove('suppressed');
        carouselVisible = false;
    }

    function openCarousel(evt) {
        evt.preventDefault();
        carousel.classList.add('active');
        doc.body.classList.add('suppressed');
        unhideLargeImg();
        carouselVisible = true;
    }

    function onKeydown(evt) {
        if (!carouselVisible) {
            return;
        }
        if (evt.key === 'Escape' || evt.keyCode === 27) {
            closeCarousel(evt);
            return ;
        }
        if (evt.ctrlKey) {
            if (evt.key === 'ArrowLeft' || evt.keyCode === 37) {
                navigate(-1);
                return ;
            } else if (evt.key === 'ArrowRight' || evt.keyCode === 39) {
                navigate(1);
                return ;
            }
        }
    }

    function activateCardZoom(evt) {
        var zoom = evt.target.querySelector('.js-zoom'),
            link = items[pos],
            href = link.href.replace('medium', 'large');

        zoom.style.backgroundImage = 'url(' + href + ')';
        zoom.classList.add('active');
        if (!zoomImg) {
            zoomImg = new Image();
        }
        if (zoomImg.src !== href) {
            zoomImg.src = href;
        }
    }
    function deactivateCardZoom(evt) {
        var zoom = evt.target.querySelector('.js-zoom');
        zoom.classList.remove('active');
    }
    function panCardZoom(evt) {
        if (!zoomImg || !zoomImg.width || !zoomImg.height) {
            return ;
        }
        var zoom = evt.currentTarget.querySelector('.js-zoom'),
            clH = zoom.clientHeight,
            clW = zoom.clientWidth,
            rect = zoom.getBoundingClientRect(),
            t = root.pageYOffset + rect.top,
            l = root.pageXOffset + rect.left,
            h = zoomImg.height,
            w = zoomImg.width,
            isV = zoomImg.height > zoomImg.width,
            ratio = isV ? h / clH : w / clW,
            x = evt.pageX - l,
            y = evt.pageY - t,
            gapX = isV ? parseInt((h - w) / 2 / ratio, 10) : 10,
            gapY = isV ? 10 : parseInt((w - h) / 2 / ratio, 10),
            bgX, bgY;

        bgX = x < gapX ? 0 : parseInt((x - gapX) * ratio, 10);
        bgX = bgX > w - clW ? w - clW : bgX;
        bgY = y < gapY ? 0 : parseInt((y - gapY) * ratio, 10);
        bgY = bgY > h - clH ? h - clH : bgY;

        zoom.style.backgroundPosition = '-' + bgX + 'px' + ' ' + '-' + bgY + 'px';
    }

    doc.body.addEventListener('keydown', onKeydown, false);

    nav.addEventListener('click', loadMediumCard, false);

    card.addEventListener('click', openCarousel, false);
    card.addEventListener('mouseenter', activateCardZoom, false);
    card.addEventListener('mouseleave', deactivateCardZoom, false);
    card.addEventListener('mousemove', throttle(panCardZoom, 32), false);
    largeImg.addEventListener('mouseenter', activateCardZoom, false);
    largeImg.addEventListener('mouseleave', deactivateCardZoom, false);
    largeImg.addEventListener('mousemove', throttle(panCardZoom, 32), false);

    close.addEventListener('click', closeCarousel, false);
    next.addEventListener('click', function (ev) { navigate(1); }, false);
    prev.addEventListener('click', function (ev) { navigate(-1); }, false);

    root.addEventListener('resize', throttle(function () {setLargeImg(items[pos]);}, 100), false);

    setLargeImg(items[0]);


}).call(this);
