document.addEventListener('DOMContentLoaded', () => {
  Fancybox.bind('[data-fancybox]', {
    dragToClose: false,
    autoFocus: false,
    placeFocusBack: false,
    Thumbs: false,
    on: {
      reveal: (fancybox, slide) => {
        const form = slide.triggerEl.dataset.form;
        const input = document.querySelector('.popup input[name="form"]');
        input.value = form;
      },
    },
  });

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

  if (window.innerWidth > 768) {
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
  }

  const casesCarouselWrapper = document.querySelector('.cases-carousel');
  if (casesCarouselWrapper) {
    const casesCarousel = new Swiper(casesCarouselWrapper, {
      spaceBetween: 8,
      slidesPerView: 'auto',
      navigation: {
        nextEl: '.cases-carousel__next',
        prevEl: '.cases-carousel__prev',
      },
    });

    const norm = (s) => (s || '').trim().toLowerCase();
    const TAG_ALL = 'все';

    function getSlideTags(slide) {
      if (slide.dataset.tags) {
        return slide.dataset.tags.split(',').map(norm).filter(Boolean);
      }
      const liTags = Array.from(slide.querySelectorAll('.cases-item__tags.categories li'))
        .map((li) => norm(li.textContent))
        .filter(Boolean);
      slide.dataset.tags = liTags.join(',');
      return liTags;
    }

    function filterSlides(tagRaw) {
      const tag = norm(tagRaw);
      const slides = casesCarousel.slides;

      slides.forEach((slide) => {
        const tags = getSlideTags(slide);
        const match = tag === TAG_ALL || tags.includes(tag);
        slide.classList.toggle('is-hidden', !match);
      });

      casesCarousel.slideTo(0, 0);
      casesCarousel.update();
    }

    const tagItems = document.querySelectorAll('.cases-tags [data-tag]');
    tagItems.forEach((item) => {
      item.addEventListener('click', () => {
        tagItems.forEach((i) => i.classList.remove('active'));
        item.classList.add('active');
        filterSlides(item.dataset.tag);
      });
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    filterSlides('Все');
  }

  const algorithmScroller = document.querySelector('.algorithm-steps__wrapper');
  if (algorithmScroller) {
    const scroller = new Scroller({
      element: algorithmScroller,
      scrollbar: 'hidden',
      navigation: 'hidden',
    });
  }

  const offerScroller = document.querySelector('.offer-scroller');
  if (offerScroller && window.innerWidth > 768) {
    const scroller = new Scroller({
      element: offerScroller,
      scrollbar: 'hidden',
      navigation: 'hidden',
    });
  }

  function generateToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 30; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }

  function setToken(form) {
    const token = generateToken();
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 't';
    hiddenInput.value = token;
    form.appendChild(hiddenInput);
  }

  const forms = document.querySelectorAll('form:not([method="get"])');
  forms.forEach(function (form) {
    setToken(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const button = form.querySelector('button.btn');

      button.style.opacity = 0.5;
      button.style.cursor = 'not-allowed';
      button.disabled = true;

      const formUrl = form.getAttribute('action');
      const formData = new FormData(this);

      fetch(formUrl, {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          Fancybox.close();
          Fancybox.show([{ src: '#popup-thanks', type: 'inline' }]);
        })
        .catch((error) => console.error('Error:', error));
    });
  });

  function getUtmParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};
    for (const [key, value] of urlParams.entries()) {
      if (key !== 's') {
        utmParams[key] = value;
      }
    }
    return utmParams;
  }

  function setUtmParamsInForms(utmParams) {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      Object.keys(utmParams).forEach((key) => {
        if (key !== 's') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = utmParams[key];
          form.appendChild(input);
        }
      });
    });
  }

  function saveUtmParamsWithExpiration(utmParams) {
    const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    const dataToSave = {
      utmParams,
      expirationTime,
    };
    localStorage.setItem('utmData', JSON.stringify(dataToSave));
  }

  function loadUtmParamsFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('utmData'));
    if (data && data.expirationTime > new Date().getTime()) {
      return data.utmParams;
    } else {
      return {};
    }
  }

  function clearUtmParamsIfExpired() {
    const data = JSON.parse(localStorage.getItem('utmData'));
    if (data && data.expirationTime <= new Date().getTime()) {
      localStorage.removeItem('utmData');
    }
  }

  const utmParamsFromUrl = getUtmParams();
  const savedUtmParams = loadUtmParamsFromLocalStorage();

  if (Object.keys(utmParamsFromUrl).length > 0) {
    setUtmParamsInForms(utmParamsFromUrl);
    saveUtmParamsWithExpiration(utmParamsFromUrl);
  } else if (Object.keys(savedUtmParams).length > 0) {
    setUtmParamsInForms(savedUtmParams);
  }

  clearUtmParamsIfExpired();

  const banner = document.querySelector('.banner');
  if (banner) {
    const bannerClose = banner.querySelector('.banner-close');
    bannerClose.addEventListener('click', () => {
      banner.style.display = 'none';
    });
  }
});
