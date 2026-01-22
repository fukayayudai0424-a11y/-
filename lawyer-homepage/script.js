/**
 * 青山法律事務所 - JavaScript
 * メニュートグル、タブ切替、フォームバリデーション等
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // モバイルメニュートグル
    // ============================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');

            // ボディのスクロールを制御
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // メニューリンクをクリックしたらメニューを閉じる
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================================
    // ヘッダーのスクロール時の挙動
    // ============================================
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;

        // スクロール位置が100px以上の場合、影を追加
        if (currentScrollY > 100) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06)';
        }

        lastScrollY = currentScrollY;
    });

    // ============================================
    // サービスタブの切り替え
    // ============================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // すべてのボタンからactiveを削除
            tabButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });

            // すべてのコンテンツからactiveを削除
            tabContents.forEach(function(content) {
                content.classList.remove('active');
            });

            // クリックされたボタンと対応するコンテンツにactiveを追加
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // ============================================
    // スムーズスクロール
    // ============================================
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            e.preventDefault();

            const targetElement = document.querySelector(href);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // お問い合わせフォームのバリデーション
    // ============================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // フォームデータの取得
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                tel: document.getElementById('tel').value.trim(),
                category: document.getElementById('category').value,
                message: document.getElementById('message').value.trim(),
                privacy: document.getElementById('privacy').checked
            };

            // バリデーション
            const errors = validateForm(formData);

            // エラーメッセージをクリア
            clearErrors();

            if (errors.length > 0) {
                // エラーがある場合は表示
                showErrors(errors);
                return;
            }

            // フォーム送信（デモなのでアラートで表示）
            showSuccessMessage();
            contactForm.reset();
        });
    }

    function validateForm(data) {
        const errors = [];

        // 名前のバリデーション
        if (!data.name) {
            errors.push({ field: 'name', message: 'お名前を入力してください' });
        }

        // メールのバリデーション
        if (!data.email) {
            errors.push({ field: 'email', message: 'メールアドレスを入力してください' });
        } else if (!isValidEmail(data.email)) {
            errors.push({ field: 'email', message: '正しいメールアドレスを入力してください' });
        }

        // 電話番号のバリデーション
        if (!data.tel) {
            errors.push({ field: 'tel', message: '電話番号を入力してください' });
        } else if (!isValidTel(data.tel)) {
            errors.push({ field: 'tel', message: '正しい電話番号を入力してください' });
        }

        // カテゴリのバリデーション
        if (!data.category) {
            errors.push({ field: 'category', message: 'ご相談内容を選択してください' });
        }

        // プライバシーポリシーのバリデーション
        if (!data.privacy) {
            errors.push({ field: 'privacy', message: 'プライバシーポリシーに同意してください' });
        }

        return errors;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidTel(tel) {
        const telRegex = /^[0-9\-]+$/;
        return telRegex.test(tel) && tel.replace(/-/g, '').length >= 10;
    }

    function showErrors(errors) {
        errors.forEach(function(error) {
            const field = document.getElementById(error.field);
            if (field) {
                field.style.borderColor = '#c53030';

                // エラーメッセージを追加
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.style.cssText = 'color: #c53030; font-size: 0.8125rem; display: block; margin-top: 4px;';
                errorElement.textContent = error.message;

                field.parentNode.appendChild(errorElement);
            }
        });

        // 最初のエラーフィールドにフォーカス
        const firstErrorField = document.getElementById(errors[0].field);
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }

    function clearErrors() {
        // すべてのエラーメッセージを削除
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(function(msg) {
            msg.remove();
        });

        // すべてのフィールドのボーダーを元に戻す
        const fields = contactForm.querySelectorAll('input, select, textarea');
        fields.forEach(function(field) {
            field.style.borderColor = '';
        });
    }

    function showSuccessMessage() {
        // 成功モーダルを表示
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="success-modal-content">
                <div class="success-icon">✓</div>
                <h3>送信完了</h3>
                <p>お問い合わせありがとうございます。<br>担当者より2営業日以内にご連絡いたします。</p>
                <button class="btn btn-primary" onclick="this.closest('.success-modal').remove()">閉じる</button>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;

        const content = modal.querySelector('.success-modal-content');
        content.style.cssText = `
            background: white;
            padding: 48px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
            animation: slideUp 0.3s ease;
        `;

        const icon = modal.querySelector('.success-icon');
        icon.style.cssText = `
            width: 64px;
            height: 64px;
            background: #38a169;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 24px;
        `;

        const h3 = modal.querySelector('h3');
        h3.style.cssText = `
            font-size: 1.5rem;
            color: #1a3a5c;
            margin-bottom: 16px;
        `;

        const p = modal.querySelector('p');
        p.style.cssText = `
            color: #666;
            margin-bottom: 24px;
            line-height: 1.7;
        `;

        document.body.appendChild(modal);

        // 背景クリックで閉じる
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ============================================
    // スクロールアニメーション（Intersection Observer）
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象の要素を監視
    const animateElements = document.querySelectorAll(
        '.concern-item, .strength-item, .service-card, .lawyer-card, .case-card, .fee-card, .flow-step'
    );

    animateElements.forEach(function(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // アニメーションクラスのスタイル
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // 電話番号の自動フォーマット
    // ============================================
    const telInput = document.getElementById('tel');

    if (telInput) {
        telInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');

            if (value.length > 11) {
                value = value.slice(0, 11);
            }

            // ハイフンを自動挿入
            if (value.length >= 4 && value.length <= 7) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length >= 8) {
                value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
            }

            e.target.value = value;
        });
    }

    // ============================================
    // ページ読み込み完了時のアニメーション
    // ============================================
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');

        // ヒーローコンテンツのアニメーション
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(30px)';

            setTimeout(function() {
                heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 100);
        }
    });

    // ============================================
    // 現在のセクションをハイライト（ナビゲーション）
    // ============================================
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function() {
        const scrollY = window.pageYOffset;
        const headerHeight = document.querySelector('.header').offsetHeight;

        sections.forEach(function(section) {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                // すべてのリンクからactiveを削除
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                });

                // 対応するリンクにactiveを追加
                const activeLink = document.querySelector('.nav-menu a[href="#' + sectionId + '"]');
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
});
