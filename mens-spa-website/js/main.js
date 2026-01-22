/**
 * LUXE SPA - Main JavaScript
 * Premium Men's Esthetic Salon
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initHeader();
  initMobileNav();
  initScrollAnimations();
  initTabs();
  initModal();
  initSmoothScroll();
});

/**
 * Header scroll effect
 */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    // Add scrolled class when scrolled down
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

/**
 * Mobile navigation toggle
 */
function initMobileNav() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuToggle || !mobileNav || !mobileNavOverlay) return;

  // Toggle menu
  menuToggle.addEventListener('click', function() {
    toggleMobileNav();
  });

  // Close on overlay click
  mobileNavOverlay.addEventListener('click', function() {
    closeMobileNav();
  });

  // Close on link click
  mobileNavLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      closeMobileNav();
    });
  });

  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMobileNav();
    }
  });

  function toggleMobileNav() {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    mobileNavOverlay.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileNav() {
    menuToggle.classList.remove('active');
    mobileNav.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Scroll animations using Intersection Observer
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  if (!animatedElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(function(el) {
    observer.observe(el);
  });
}

/**
 * Tab switching functionality
 */
function initTabs() {
  const tabContainers = document.querySelectorAll('.schedule-tabs');

  tabContainers.forEach(function(container) {
    const tabs = container.querySelectorAll('.schedule-tab');

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs in this container
        tabs.forEach(function(t) {
          t.classList.remove('active');
        });

        // Add active class to clicked tab
        this.classList.add('active');

        // Handle shop filter if data-shop attribute exists
        const shop = this.getAttribute('data-shop');
        if (shop) {
          handleShopFilter(shop);
        }

        // Handle therapist filter if data-filter attribute exists
        const filter = this.getAttribute('data-filter');
        if (filter) {
          handleTherapistFilter(filter);
        }
      });
    });
  });
}

/**
 * Filter shop schedules
 */
function handleShopFilter(shop) {
  const ginzaSchedule = document.getElementById('ginza-schedule');
  const shinjukuSchedule = document.getElementById('shinjuku-schedule');

  if (!ginzaSchedule || !shinjukuSchedule) return;

  if (shop === 'ginza') {
    ginzaSchedule.style.display = 'block';
    shinjukuSchedule.style.display = 'none';
  } else if (shop === 'shinjuku') {
    ginzaSchedule.style.display = 'none';
    shinjukuSchedule.style.display = 'block';
  } else {
    ginzaSchedule.style.display = 'block';
    shinjukuSchedule.style.display = 'block';
  }
}

/**
 * Filter therapists
 */
function handleTherapistFilter(filter) {
  // This would be implemented based on actual data structure
  console.log('Filter therapists by:', filter);
}

/**
 * Modal functionality for therapist details
 */
function initModal() {
  const modal = document.getElementById('therapistModal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close');
  const therapistCards = document.querySelectorAll('[data-modal]');

  // Therapist data (in real implementation, this would come from a database)
  const therapistData = {
    misaki: {
      name: '美咲',
      nameEn: 'MISAKI',
      age: '24歳',
      height: '162cm',
      blood: 'A型',
      shop: '銀座店',
      badge: 'NEW',
      message: 'はじめまして、美咲です。<br><br>お客様に心からリラックスしていただけるよう、一生懸命施術させていただきます。日頃のお疲れを癒すお手伝いができれば幸いです。<br><br>アロマの香りに包まれながら、ゆったりとした時間をお過ごしください。皆様のご来店を心よりお待ちしております。'
    },
    akari: {
      name: 'あかり',
      nameEn: 'AKARI',
      age: '26歳',
      height: '158cm',
      blood: 'O型',
      shop: '銀座店',
      badge: '',
      message: 'あかりと申します。<br><br>お客様一人ひとりに合わせた丁寧な施術を心がけています。仕事や日常の疲れを忘れて、極上のリラックスタイムをお過ごしいただければ嬉しいです。<br><br>ぜひお気軽にいらしてください。'
    },
    hinata: {
      name: 'ひなた',
      nameEn: 'HINATA',
      age: '23歳',
      height: '165cm',
      blood: 'B型',
      shop: '銀座店',
      badge: 'PICK UP',
      message: 'ひなたです。<br><br>明るく元気に、でも施術は丁寧に。お客様に癒しと元気をお届けできるよう頑張ります。<br><br>お会いできることを楽しみにしています。'
    },
    rio: {
      name: 'りお',
      nameEn: 'RIO',
      age: '25歳',
      height: '160cm',
      blood: 'AB型',
      shop: '銀座店',
      badge: '',
      message: 'りおです。<br><br>アロマセラピーの資格を持っています。香りと技術で、心身ともにリフレッシュしていただけるよう施術いたします。<br><br>お待ちしております。'
    }
  };

  // Open modal on card click
  therapistCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const therapistId = this.getAttribute('data-modal');
      openModal(therapistId);
    });
  });

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close on background click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  function openModal(therapistId) {
    const data = therapistData[therapistId];

    if (data) {
      // Update modal content
      const modalName = document.getElementById('modalName');
      const modalNameEn = document.getElementById('modalNameEn');
      const modalAge = document.getElementById('modalAge');
      const modalHeight = document.getElementById('modalHeight');
      const modalBlood = document.getElementById('modalBlood');
      const modalShop = document.getElementById('modalShop');
      const modalBadge = document.getElementById('modalBadge');
      const modalMessage = document.getElementById('modalMessage');

      if (modalName) modalName.textContent = data.name;
      if (modalNameEn) modalNameEn.textContent = data.nameEn;
      if (modalAge) modalAge.textContent = data.age;
      if (modalHeight) modalHeight.textContent = data.height;
      if (modalBlood) modalBlood.textContent = data.blood;
      if (modalShop) modalShop.textContent = data.shop;
      if (modalBadge) {
        modalBadge.textContent = data.badge;
        modalBadge.style.display = data.badge ? 'block' : 'none';
      }
      if (modalMessage) modalMessage.innerHTML = data.message;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Animate in
    setTimeout(function() {
      modal.style.opacity = '1';
    }, 10);
  }

  function closeModal() {
    modal.style.opacity = '0';
    setTimeout(function() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#" or "#reserve" (special cases)
      if (href === '#' || href === '#reserve') return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        const headerHeight = document.getElementById('header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Utility: Format phone number for tel: links
 */
function formatPhoneNumber(number) {
  return number.replace(/-/g, '');
}

/**
 * Lazy load images (if needed in future)
 */
function initLazyLoad() {
  const lazyImages = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.remove('lazy');
          imageObserver.unobserve(image);
        }
      });
    });

    lazyImages.forEach(function(image) {
      imageObserver.observe(image);
    });
  } else {
    // Fallback for browsers without Intersection Observer
    lazyImages.forEach(function(image) {
      image.src = image.dataset.src;
    });
  }
}

/**
 * Form validation (if contact form is added)
 */
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;

  inputs.forEach(function(input) {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }

    // Email validation
    if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        input.classList.add('error');
      }
    }

    // Phone validation
    if (input.type === 'tel' && input.value) {
      const phoneRegex = /^[0-9-]+$/;
      if (!phoneRegex.test(input.value)) {
        isValid = false;
        input.classList.add('error');
      }
    }
  });

  return isValid;
}

// Export functions for potential use in other scripts
window.LUXESPA = {
  initHeader: initHeader,
  initMobileNav: initMobileNav,
  initScrollAnimations: initScrollAnimations,
  initTabs: initTabs,
  initModal: initModal,
  initSmoothScroll: initSmoothScroll,
  debounce: debounce,
  validateForm: validateForm
};
