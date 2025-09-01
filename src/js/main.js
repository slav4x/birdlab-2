window.addEventListener('load', () => {
  scaleContent();
});

window.addEventListener('resize', () => {
  scaleContent();
});

document.addEventListener('DOMContentLoaded', () => {
  // Fancybox.bind('[data-fancybox]', {
  //   dragToClose: false,
  //   autoFocus: false,
  //   placeFocusBack: false,
  //   Thumbs: false,
  // });

  scaleContent();

  const partnersCarousel = new Swiper('.partners-carousel', {
    loop: true,
    spaceBetween: 8,
    slidesPerView: 'auto',
    speed: 5000,
    autoplay: {
      delay: 1,
    },
    freeMode: true,
  });

  const joinCarousel = new Swiper('.partners-join__carousel', {
    direction: 'vertical',
    loop: true,
    slidesPerView: 'auto',
    speed: 5000,
    autoplay: {
      delay: 1,
    },
    freeMode: true,
  });

  const casesCarousel = new Swiper('.cases-carousel', {
    spaceBetween: 8,
    slidesPerView: 3,
    navigation: {
      nextEl: '.cases-carousel__next',
      prevEl: '.cases-carousel__prev',
    },
  });

  const algorithmScroller = document.querySelector('.algorithm-steps__wrapper');
  if (algorithmScroller) {
    const scroller = new Scroller({
      element: algorithmScroller,
      scrollbar: 'hidden',
      navigation: 'hidden',
    });
  }

  const offerScroller = document.querySelector('.offer-scroller');
  if (offerScroller) {
    const scroller = new Scroller({
      element: offerScroller,
      scrollbar: 'hidden',
      navigation: 'hidden',
    });
  }
});

document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href').slice(1);
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  e.preventDefault();

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    let offsetTop = targetEl.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  }
});
