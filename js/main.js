/**
 * SISUI - Hair Quality Improvement Salon Products
 * Main JavaScript - Version 2.0 Enhanced
 */

(function() {
    'use strict';

    // DOM Elements
    const loading = document.getElementById('loading');
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-list a');
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');
    const backToTop = document.getElementById('backToTop');

    // ========================================
    // Loading Screen
    // ========================================
    function hideLoading() {
        setTimeout(() => {
            loading.classList.add('hidden');
            document.body.style.overflow = '';
            initAnimations();
            initCountUp();
        }, 2000);
    }

    // ========================================
    // Custom Cursor (PC only)
    // ========================================
    function initCustomCursor() {
        if (!cursor || !cursorFollower) return;
        if (window.matchMedia('(hover: none)').matches) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            // Smooth follow effect
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;

            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .product-card, .ingredient-card, .voice-card, .gallery-item');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorFollower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorFollower.classList.remove('hover');
            });
        });
    }

    // ========================================
    // Header Scroll Effect
    // ========================================
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Header
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back to top button
        if (backToTop) {
            if (scrollTop > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    // ========================================
    // Mobile Navigation
    // ========================================
    function toggleMobileNav() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');

        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMobileNav() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================================
    // Smooth Scroll
    // ========================================
    function smoothScroll(e) {
        const href = this.getAttribute('href');

        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                closeMobileNav();
            }
        }
    }

    // ========================================
    // Back to Top
    // ========================================
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // ========================================
    // Scroll Animations
    // ========================================
    function initAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // ========================================
    // Count Up Animation
    // ========================================
    function initCountUp() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-count'));
                    animateValue(el, 0, target, 2000);
                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        statNumbers.forEach(el => {
            observer.observe(el);
        });
    }

    function animateValue(el, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (range * easeOut));

            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ========================================
    // FAQ Accordion
    // ========================================
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (question && answer) {
                question.addEventListener('click', () => {
                    const isOpen = question.getAttribute('aria-expanded') === 'true';

                    // Close all other items
                    faqItems.forEach(otherItem => {
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherItem !== item) {
                            otherQuestion.setAttribute('aria-expanded', 'false');
                            otherAnswer.classList.remove('open');
                        }
                    });

                    // Toggle current item
                    question.setAttribute('aria-expanded', !isOpen);
                    if (!isOpen) {
                        answer.classList.add('open');
                    } else {
                        answer.classList.remove('open');
                    }
                });
            }
        });
    }

    // ========================================
    // Voice Slider (Simple)
    // ========================================
    function initVoiceSlider() {
        const slider = document.getElementById('voiceSlider');
        const prevBtn = document.getElementById('voicePrev');
        const nextBtn = document.getElementById('voiceNext');

        if (!slider || !prevBtn || !nextBtn) return;

        const cards = slider.querySelectorAll('.voice-card');
        if (cards.length === 0) return;

        let currentIndex = 0;
        const visibleCards = getVisibleCards();

        function getVisibleCards() {
            if (window.innerWidth < 768) return 1;
            if (window.innerWidth < 1200) return 2;
            return 4;
        }

        function updateSlider() {
            const visible = getVisibleCards();
            const maxIndex = Math.max(0, cards.length - visible);
            currentIndex = Math.min(currentIndex, maxIndex);

            cards.forEach((card, index) => {
                if (index >= currentIndex && index < currentIndex + visible) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                }
            });

            // Update button states
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
        }

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        nextBtn.addEventListener('click', () => {
            const visible = getVisibleCards();
            const maxIndex = Math.max(0, cards.length - visible);
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });

        window.addEventListener('resize', () => {
            updateSlider();
        });

        updateSlider();
    }

    // ========================================
    // Parallax Effect (subtle)
    // ========================================
    function handleParallax() {
        const scrollTop = window.pageYOffset;
        const floatingElements = document.querySelectorAll('.float-circle, .float-leaf');

        floatingElements.forEach((el, index) => {
            const speed = 0.02 + (index * 0.01);
            el.style.transform = `translateY(${scrollTop * speed}px)`;
        });
    }

    // ========================================
    // Active Navigation Link
    // ========================================
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + header.offsetHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-list a[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }

    // ========================================
    // Throttle Function
    // ========================================
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========================================
    // Debounce Function
    // ========================================
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ========================================
    // Event Listeners
    // ========================================
    function init() {
        // Loading
        document.body.style.overflow = 'hidden';
        window.addEventListener('load', hideLoading);

        // Custom cursor
        initCustomCursor();

        // Scroll events
        const throttledScroll = throttle(() => {
            handleScroll();
            updateActiveNav();
        }, 16);

        const debouncedParallax = throttle(handleParallax, 16);

        window.addEventListener('scroll', throttledScroll);
        window.addEventListener('scroll', debouncedParallax);

        // Mobile navigation
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileNav);
        }

        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', smoothScroll);
        });

        // Back to top
        if (backToTop) {
            backToTop.addEventListener('click', scrollToTop);
        }

        // FAQ
        initFAQ();

        // Voice slider
        initVoiceSlider();

        // Close mobile nav on window resize
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768) {
                closeMobileNav();
            }
        }, 100));

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') &&
                !nav.contains(e.target) &&
                !hamburger.contains(e.target)) {
                closeMobileNav();
            }
        });

        // Initial scroll check
        handleScroll();

        // Image loading enhancement
        enhanceImageLoading();
    }

    // ========================================
    // Image Loading Enhancement
    // ========================================
    function enhanceImageLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px 0px' });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // ========================================
    // Initialize
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
