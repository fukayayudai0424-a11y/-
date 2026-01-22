/**
 * 青山法律事務所 - Premium JavaScript
 * 高度なインタラクション・アニメーション
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // Loading Screen
    // ============================================
    const loader = document.getElementById('loader');

    // ローダーを1.5秒後に非表示（フォント読み込み待ちなし）
    setTimeout(function() {
        if (loader) {
            loader.classList.add('hidden');
        }
        document.body.classList.remove('no-scroll');
        initAnimations();
    }, 1500);

    // ============================================
    // Header Scroll Effect
    // ============================================
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // ============================================
    // Mobile Menu
    // ============================================
    const menuToggle = document.getElementById('menuToggle');
    const navWrapper = document.getElementById('navWrapper');
    const navLinks = document.querySelectorAll('.nav-menu a, .nav-cta');

    if (menuToggle && navWrapper) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navWrapper.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navWrapper.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // ============================================
    // Smooth Scroll
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // Service Tabs
    // ============================================
    const serviceTabs = document.querySelectorAll('.service-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    serviceTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            serviceTabs.forEach(function(t) {
                t.classList.remove('active');
            });

            tabPanels.forEach(function(panel) {
                panel.classList.remove('active');
            });

            this.classList.add('active');
            document.getElementById('panel-' + targetTab).classList.add('active');
        });
    });

    // ============================================
    // FAQ Accordion
    // ============================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(function(faq) {
                faq.classList.remove('active');
            });

            // Open clicked if was closed
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ============================================
    // Cases Slider
    // ============================================
    const casesTrack = document.querySelector('.cases-track');
    const caseCards = document.querySelectorAll('.case-card');
    const prevBtn = document.querySelector('.cases-nav-btn.prev');
    const nextBtn = document.querySelector('.cases-nav-btn.next');

    if (casesTrack && caseCards.length > 0) {
        let currentIndex = 0;
        const cardWidth = caseCards[0].offsetWidth;
        const gap = 32; // var(--space-xl)
        const maxIndex = Math.max(0, caseCards.length - 2);

        function updateSlider() {
            const offset = currentIndex * (cardWidth + gap);
            casesTrack.style.transform = `translateX(-${offset}px)`;
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', function() {
                currentIndex = Math.max(0, currentIndex - 1);
                updateSlider();
            });

            nextBtn.addEventListener('click', function() {
                currentIndex = Math.min(maxIndex, currentIndex + 1);
                updateSlider();
            });
        }

        // Auto slide
        setInterval(function() {
            currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
            updateSlider();
        }, 5000);
    }

    // ============================================
    // Counter Animation
    // ============================================
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');

        counters.forEach(function(counter) {
            if (counter.classList.contains('counted')) return;

            const target = parseFloat(counter.dataset.count);
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

                let current = start + (target - start) * easeProgress;

                if (target % 1 !== 0) {
                    // Decimal number
                    counter.textContent = current.toFixed(1);
                } else {
                    // Integer
                    counter.textContent = Math.floor(current).toLocaleString();
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.classList.add('counted');
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // ============================================
    // Scroll Animations (AOS-like)
    // ============================================
    function initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');

                    // Trigger counter animation for stats
                    const counters = entry.target.querySelectorAll('[data-count]');
                    if (counters.length > 0 || entry.target.hasAttribute('data-count')) {
                        animateCounters();
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-aos]').forEach(function(el) {
            observer.observe(el);
        });

        // Also observe hero stats for counter animation
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            observer.observe(heroStats);
        }

        const voiceSummary = document.querySelector('.voice-summary');
        if (voiceSummary) {
            observer.observe(voiceSummary);
        }

        const reasonData = document.querySelectorAll('.reason-data');
        reasonData.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ============================================
    // Contact Form
    // ============================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                tel: document.getElementById('tel').value.trim(),
                category: document.getElementById('category').value,
                preferred_time: document.getElementById('preferred_time').value,
                message: document.getElementById('message').value.trim(),
                privacy: document.getElementById('privacy').checked
            };

            // Validation
            const errors = validateForm(formData);
            clearErrors();

            if (errors.length > 0) {
                showErrors(errors);
                return;
            }

            // Success
            showSuccessModal();
            contactForm.reset();
        });
    }

    function validateForm(data) {
        const errors = [];

        if (!data.name) {
            errors.push({ field: 'name', message: 'お名前を入力してください' });
        }

        if (!data.email) {
            errors.push({ field: 'email', message: 'メールアドレスを入力してください' });
        } else if (!isValidEmail(data.email)) {
            errors.push({ field: 'email', message: '正しいメールアドレスを入力してください' });
        }

        if (!data.tel) {
            errors.push({ field: 'tel', message: '電話番号を入力してください' });
        } else if (!isValidTel(data.tel)) {
            errors.push({ field: 'tel', message: '正しい電話番号を入力してください' });
        }

        if (!data.category) {
            errors.push({ field: 'category', message: 'ご相談内容を選択してください' });
        }

        if (!data.privacy) {
            errors.push({ field: 'privacy', message: 'プライバシーポリシーに同意してください' });
        }

        return errors;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidTel(tel) {
        const digits = tel.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
    }

    function showErrors(errors) {
        errors.forEach(function(error) {
            const field = document.getElementById(error.field);
            if (field) {
                field.style.borderColor = '#ef4444';

                const errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                errorEl.style.cssText = 'color: #ef4444; font-size: 0.8125rem; margin-top: 4px; display: block;';
                errorEl.textContent = error.message;

                field.parentNode.appendChild(errorEl);
            }
        });

        const firstError = document.getElementById(errors[0].field);
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(function(el) {
            el.remove();
        });

        contactForm.querySelectorAll('input, select, textarea').forEach(function(field) {
            field.style.borderColor = '';
        });
    }

    function showSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="success-modal-overlay"></div>
            <div class="success-modal-content">
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
                <h3>送信完了</h3>
                <p>お問い合わせありがとうございます。<br>担当者より1営業日以内にご連絡いたします。</p>
                <button class="btn btn-primary" onclick="this.closest('.success-modal').remove()">閉じる</button>
            </div>
        `;

        // Styles
        const styles = `
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            .success-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
            }
            .success-modal-content {
                position: relative;
                background: white;
                padding: 48px;
                border-radius: 16px;
                text-align: center;
                max-width: 400px;
                margin: 20px;
                animation: slideUp 0.4s ease;
            }
            .success-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 24px;
                background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .success-icon svg {
                width: 40px;
                height: 40px;
                color: white;
            }
            .success-modal h3 {
                font-size: 1.5rem;
                color: #1a3a5c;
                margin-bottom: 16px;
            }
            .success-modal p {
                color: #4a5568;
                margin-bottom: 24px;
                line-height: 1.7;
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        document.body.appendChild(modal);

        // Close on overlay click
        modal.querySelector('.success-modal-overlay').addEventListener('click', function() {
            modal.remove();
        });
    }

    // ============================================
    // Phone Number Auto Format
    // ============================================
    const telInput = document.getElementById('tel');

    if (telInput) {
        telInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 11) {
                value = value.slice(0, 11);
            }

            // Format with hyphens
            if (value.length >= 4 && value.length <= 7) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length >= 8) {
                value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
            }

            e.target.value = value;
        });
    }

    // ============================================
    // Active Navigation on Scroll
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navMenuLinks = document.querySelectorAll('.nav-menu a');

    function highlightNav() {
        const scrollY = window.pageYOffset;
        const headerHeight = header.offsetHeight;

        sections.forEach(function(section) {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navMenuLinks.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav);

    // ============================================
    // Parallax Effect (subtle)
    // ============================================
    const heroBg = document.querySelector('.hero-bg');

    if (heroBg) {
        window.addEventListener('scroll', function() {
            const scrollY = window.pageYOffset;
            if (scrollY < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
        });
    }

    // ============================================
    // Button Ripple Effect
    // ============================================
    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(function() {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    // ============================================
    // Lazy Load Images
    // ============================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // ============================================
    // Fixed CTA Visibility
    // ============================================
    const fixedCta = document.getElementById('fixedCta');
    const contactSection = document.getElementById('contact');

    if (fixedCta && contactSection) {
        window.addEventListener('scroll', function() {
            const contactTop = contactSection.offsetTop;
            const scrollY = window.pageYOffset;
            const windowHeight = window.innerHeight;

            if (scrollY + windowHeight > contactTop) {
                fixedCta.style.transform = 'translateY(100%)';
            } else {
                fixedCta.style.transform = 'translateY(0)';
            }
        });
    }

    // ============================================
    // Initialize on page ready
    // ============================================

    // Initial highlight
    highlightNav();

    // Preload hero stat counters
    setTimeout(animateCounters, 2000);

});

// ============================================
// Prevent FOUC (Flash of Unstyled Content)
// ============================================
document.documentElement.style.visibility = 'visible';
