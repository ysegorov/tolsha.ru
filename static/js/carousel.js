
(function () {

    'use strict';

    var root = this,
        doc = root.document;

    var carousel = doc.querySelector('.js-carousel'),
        next = carousel && carousel.querySelector('.js-carousel-next'),
        prev = carousel && carousel.querySelector('.js-carousel-prev'),
        pos = 0,
        items = carousel && carousel.querySelectorAll('.js-carousel-list .js-carousel-item') || [],
        count = items.length,
        current = items && items[0],
        interval;

    if (!carousel) {
        return ;
    }

    function autoplay() {
        if (interval) {
            root.clearInterval(interval);
        }
        interval = root.setInterval(function () { navigate(1); }, 3000);
    }

    function navigate(delta) {

        current.classList.remove('current');
        pos += delta;
        if (pos < 0) {
            pos = count - 1;
        } else if (pos >= count) {
            pos = 0;
        }
        current = items[pos];
        current.classList.add('current');
    }

    next.addEventListener('click', function (ev) { navigate(1); }, false);
    prev.addEventListener('click', function (ev) { navigate(-1); }, false);

    carousel.addEventListener('mouseenter', function (ev) { root.clearInterval(interval); }, false);
    carousel.addEventListener('mouseleave', function (ev) { autoplay(); }, false);

    autoplay();

}).call(this);
