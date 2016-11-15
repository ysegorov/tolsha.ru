
(function () {

    'use strict';

    var root = this,
        doc = root.document;

    var object = doc.querySelector('.object'),
        cards = object && object.querySelector('.object-cards'),
        card = cards && cards.querySelector('.object-card'),
        nav = cards && cards.querySelector('.object-cards-nav'),
        items = nav && nav.querySelectorAll('.object-card-link') || [],
        largeImg = object && object.querySelector('.object-image'),
        carousel = object && object.querySelector('.object-carousel'),
        next = carousel && carousel.querySelector('.object-carousel-next'),
        prev = carousel && carousel.querySelector('.object-carousel-prev'),
        close = carousel && carousel.querySelector('.object-carousel-close'),
        carouselVisible = false,
        pos = 0,
        last = items.length - 1;

    if (!cards) {
        return ;
    }

    function setObjectImage(url, el) {
        el = el || largeImg;
        function setSrc() {
            el.src = url;
            el.removeEventListener('transitionend', setSrc);
        }
        el.addEventListener('transitionend', setSrc, false);
        el.style.opacity = 0;
    }

    function unhideLargeImg() {
        largeImg.style.opacity = 1;
    }

    function loadMediumCard(ev) {
        ev.preventDefault();

        var selector = '.object-card-link',
            target = ev.target,
            link = target.matches(selector) ? target : target.closest(selector),
            href = link && link.href,
            idx = link && link.dataset.pos,
            largeImgUrl = link && link.dataset.large;

        if (!link) {
            return ;
        }

        card.style.backgroundImage = 'url(' + href + ')';
        if (card.scrollIntoView) {
            card.scrollIntoView(false);
        }
        pos = parseInt(idx, 10);
        largeImg.src = largeImgUrl;
    }

    function navigate(delta) {
        var el;
        pos += delta;
        pos = pos > last ? 0 : pos < 0 ? last : pos;
        el = items[pos];
        if (el) {
            setObjectImage(el.dataset.large);
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

    doc.body.addEventListener('keydown', onKeydown, false);

    nav.addEventListener('click', loadMediumCard, false);
    largeImg.addEventListener('load', unhideLargeImg, false);

    card.addEventListener('click', openCarousel, false);
    close.addEventListener('click', closeCarousel, false);
    next.addEventListener('click', function (ev) { navigate(1); }, false);
    prev.addEventListener('click', function (ev) { navigate(-1); }, false);


}).call(this);
