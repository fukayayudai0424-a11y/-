/**
 * SISUI - Hair Quality Improvement Salon Products
 * Main JavaScript
 */

(function() {
    'use strict';

    // DOM Elements
    const loading = document.getElementById('loading');
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-list a');

    // ========================================
    // Loading Screen
    // ========================================
    function hideLoading() {
        setTimeout(() => {
            loading.classList.add('hidden');
            document.body.style.overflow = '';
            initAnimations();
        }, 1500);
    }

    // ========================================
    // Header Scroll Effect
    // ========================================
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
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
    // Scroll Animations
    // ========================================
    function initAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
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
    // Parallax Effect (subtle)
    // ========================================
    function handleParallax() {
        const scrollTop = window.pageYOffset;
        const heroBg = document.querySelector('.hero-bg');

        if (heroBg && scrollTop < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrollTop * 0.3}px)`;
        }
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
    // Event Listeners
    // ========================================
    function init() {
        // Loading
        document.body.style.overflow = 'hidden';
        window.addEventListener('load', hideLoading);

        // Scroll events
        const throttledScroll = throttle(() => {
            handleScroll();
            handleParallax();
            updateActiveNav();
        }, 16);

        window.addEventListener('scroll', throttledScroll);

        // Mobile navigation
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileNav);
        }

        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', smoothScroll);
        });

        // Close mobile nav on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileNav();
            }
        });

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
