// モバイルメニューの制御
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    let isMenuOpen = false;

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            isMenuOpen = !isMenuOpen;
            navLinks.classList.toggle('active');
            mobileMenuButton.innerHTML = isMenuOpen ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
            document.body.style.overflow = isMenuOpen ? 'hidden' : '';
            
            // メニューが開いたときのアニメーション
            if (isMenuOpen) {
                navLinks.querySelectorAll('a').forEach((link, index) => {
                    link.style.animation = `slideIn 0.3s ease forwards ${index * 0.1}s`;
                });
            } else {
                navLinks.querySelectorAll('a').forEach(link => {
                    link.style.animation = '';
                });
            }
        });

        // メニュー項目をクリックしたらメニューを閉じる
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = '';
                isMenuOpen = false;
                
                // アニメーションをリセット
                navLinks.querySelectorAll('a').forEach(link => {
                    link.style.animation = '';
                });
            });
        });

        // 画面の外側をクリックしたらメニューを閉じる
        document.addEventListener('click', function(event) {
            if (isMenuOpen && !event.target.closest('.nav-links') && !event.target.closest('.mobile-menu-button')) {
                navLinks.classList.remove('active');
                mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = '';
                isMenuOpen = false;
                
                // アニメーションをリセット
                navLinks.querySelectorAll('a').forEach(link => {
                    link.style.animation = '';
                });
            }
        });
    }

    // 画面サイズが変更された時にメニューを閉じる
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen) {
            navLinks.classList.remove('active');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = '';
            isMenuOpen = false;
            
            // アニメーションをリセット
            navLinks.querySelectorAll('a').forEach(link => {
                link.style.animation = '';
            });
        }
    });
});

// スクロール時のヘッダー制御
let lastScrollTop = 0;
const header = document.querySelector('.header');
const scrollThreshold = 50;

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll > scrollThreshold) {
        header.classList.add('header-scrolled');
        
        if (currentScroll > lastScrollTop) {
            // 下スクロール時
            header.classList.add('header-hidden');
        } else {
            // 上スクロール時
            header.classList.remove('header-hidden');
        }
    } else {
        header.classList.remove('header-scrolled');
        header.classList.remove('header-hidden');
    }
    
    lastScrollTop = currentScroll;
});

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: targetPosition - headerHeight,
                behavior: 'smooth'
            });
        }
    });
});

// フォームバリデーション
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // ログインフォームの特別処理
        if (form.id === 'loginForm') {
            handleLogin(form);
            return;
        }

        // 登録フォームの特別処理
        if (form.id === 'registerForm') {
            handleRegistration(form);
            return;
        }

        // 既存のバリデーション処理を継続
        let isValid = true;
        const errorMessages = [];
        
        // 必須項目のチェック
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                errorMessages.push(`${field.getAttribute('placeholder') || field.getAttribute('name')}は必須項目です`);
            } else {
                field.classList.remove('error');
            }
        });
        
        // メールアドレスの形式チェック
        const emailField = form.querySelector('input[type="email"]');
        if (emailField && emailField.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value)) {
                isValid = false;
                emailField.classList.add('error');
                errorMessages.push('正しいメールアドレスの形式で入力してください');
            }
        }
        
        // パスワードの強度チェック
        const passwordField = form.querySelector('input[type="password"]');
        if (passwordField && passwordField.value) {
            const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordPattern.test(passwordField.value)) {
                isValid = false;
                passwordField.classList.add('error');
                errorMessages.push('パスワードは8文字以上で、英字と数字を含める必要があります');
            }
        }
        
        // エラーメッセージの表示
        const errorContainer = form.querySelector('.error-messages') || 
            (() => {
                const container = document.createElement('div');
                container.className = 'error-messages';
                form.insertBefore(container, form.firstChild);
                return container;
            })();
        
        if (!isValid) {
            errorContainer.innerHTML = errorMessages.map(msg => `<p class="error-message">${msg}</p>`).join('');
            errorContainer.style.display = 'block';
        } else {
            errorContainer.style.display = 'none';
            // ここで実際のフォーム送信処理を行う
            console.log('フォームが正常に送信されました');
        }
    });
});

// 画像の遅延読み込み
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
});

// トースト通知
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                          type === 'error' ? 'fa-exclamation-circle' : 
                          'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // アニメーション
    requestAnimationFrame(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    });
}

// ダークモード切り替え
const darkModeToggle = document.querySelector('.dark-mode-toggle');
if (darkModeToggle) {
    const darkMode = localStorage.getItem('darkMode') === 'enabled';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', 
            document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
        );
    });
}

// ログイン状態の確認
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const restrictedPages = [
        'matches.html',
        'messages.html',
        'events.html',
        'community.html',
        'search.html',
        'mypage.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isLoggedIn) {
        // ログイン済みユーザーがログインページやサインアップページにアクセスした場合
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            window.location.href = 'mypage.html';
            return;
        }
    } else {
        // 非ログインユーザーが制限付きページにアクセスした場合
        if (restrictedPages.includes(currentPage)) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    // ナビゲーションの更新
    updateNavigation();
}

// ナビゲーションの更新
function updateNavigation(isInPagesDir = false) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const navLinks = document.querySelector('.nav-links');
    const basePath = isInPagesDir ? '../' : '';
    
    if (isLoggedIn) {
        navLinks.innerHTML = `
            <a href="${basePath}pages/matches.html" class="nav-link">
                <i class="fas fa-users"></i>
                <span>お相手</span>
            </a>
            <a href="${basePath}pages/messages.html" class="nav-link">
                <i class="fas fa-comments"></i>
                <span>メッセージ</span>
            </a>
            <a href="${basePath}pages/events.html" class="nav-link">
                <i class="fas fa-calendar"></i>
                <span>イベント</span>
            </a>
            <a href="${basePath}pages/community.html" class="nav-link">
                <i class="fas fa-globe"></i>
                <span>コミュニティ</span>
            </a>
            <a href="${basePath}pages/mypage.html" class="nav-link">
                <i class="fas fa-user"></i>
                <span>マイページ</span>
            </a>
            <a href="${basePath}pages/safety.html" class="nav-link">
                <i class="fas fa-shield-alt"></i>
                <span>安全ガイド</span>
            </a>
            <a href="#" class="nav-link btn-logout" onclick="handleLogout(event)">
                <i class="fas fa-sign-out-alt"></i>
                <span>ログアウト</span>
            </a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="${isInPagesDir ? '../' : ''}#features" class="nav-link">
                <i class="fas fa-star"></i>
                <span>特徴</span>
            </a>
            <a href="${isInPagesDir ? '../' : ''}#pricing" class="nav-link">
                <i class="fas fa-tags"></i>
                <span>料金</span>
            </a>
            <a href="${basePath}pages/safety.html" class="nav-link">
                <i class="fas fa-shield-alt"></i>
                <span>安全ガイド</span>
            </a>
            <a href="${basePath}pages/login.html" class="nav-link btn-login">
                <i class="fas fa-sign-in-alt"></i>
                <span>ログイン</span>
            </a>
            <a href="${basePath}pages/register.html" class="nav-link btn-register">
                <i class="fas fa-user-plus"></i>
                <span>新規登録</span>
            </a>
        `;
    }

    // 現在のページに応じてactiveクラスを設定
    const currentPath = window.location.pathname;
    const links = navLinks.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// ログアウト処理
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    window.location.href = '../index.html';
}

function handleLogin(form) {
    // デモ用：任意の入力でログイン成功
    localStorage.setItem('isLoggedIn', 'true');
    const demoProfile = {
        name: 'ゲストユーザー',
        email: form.querySelector('#email').value,
        avatar: 'https://via.placeholder.com/150',
        status: 'プレミアム会員',
        joinDate: new Date().toISOString()
    };
    localStorage.setItem('userProfile', JSON.stringify(demoProfile));
    showToast('ログインしました', 'success');
    setTimeout(() => {
        window.location.href = 'mypage.html';
    }, 1000);
}

function handleRegistration(form) {
    // デモ用：登録成功
    localStorage.setItem('isLoggedIn', 'true');
    const newProfile = {
        name: form.querySelector('#username').value,
        email: form.querySelector('#email').value,
        avatar: 'https://via.placeholder.com/150',
        status: '一般会員',
        joinDate: new Date().toISOString()
    };
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    showToast('アカウントを作成しました', 'success');
    setTimeout(() => {
        window.location.href = 'mypage.html';
    }, 1000);
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    updateNavigation(window.location.pathname.includes('/pages/'));
});

// ページ固有の初期化処理
function initializePageSpecificBehavior() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (publicPages.includes(currentPage)) {
        // 公開ページの初期化処理
        return;
    }
    
    if (!localStorage.getItem('isLoggedIn')) {
        return;
    }
    
    // 以下、ログイン済みユーザー向けの処理
    switch (currentPage) {
        case 'mypage.html':
            loadUserProfile();
            break;
        case 'community.html':
            restoreJoinedCommunities();
            break;
        case 'messages.html':
            loadMessages();
            break;
        // 他のページ固有の初期化処理を追加
    }
}

function initializeMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    function toggleMenu() {
        navLinks.classList.toggle('active');
        const isOpen = navLinks.classList.contains('active');
        mobileMenuButton.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }
    
    mobileMenuButton.addEventListener('click', toggleMenu);
    
    // メニュー項目をクリックしたらメニューを閉じる
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
    
    // 画面外をクリックしたらメニューを閉じる
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !navLinks.contains(e.target) && 
            !mobileMenuButton.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // リサイズ時の処理
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
} 