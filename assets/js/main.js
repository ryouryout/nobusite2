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
        });
    }

    // 画面サイズが変更された時にメニューを閉じる
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen) {
            navLinks.classList.remove('active');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = '';
            isMenuOpen = false;
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
function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isInPagesDir = window.location.pathname.includes('/pages/');
    const prefix = isInPagesDir ? '' : 'pages/';
    
    if (isLoggedIn) {
        navLinks.innerHTML = `
            <a href="${prefix}matches.html">お相手</a>
            <a href="${prefix}messages.html">メッセージ</a>
            <a href="${prefix}events.html">イベント</a>
            <a href="${prefix}community.html">コミュニティ</a>
            <a href="${prefix}search.html">検索</a>
            <a href="${prefix}mypage.html">マイページ</a>
            <a href="${prefix}safety.html">安全ガイド</a>
            <a href="#" class="btn btn-primary" onclick="handleLogout(event)">ログアウト</a>
        `;
    } else {
        const featuresLink = isInPagesDir ? '../index.html#features' : '#features';
        const pricingLink = isInPagesDir ? '../index.html#pricing' : '#pricing';
        
        navLinks.innerHTML = `
            <a href="${featuresLink}">特徴</a>
            <a href="${pricingLink}">料金</a>
            <a href="${prefix}safety.html">安全ガイド</a>
            <a href="${prefix}login.html" class="btn btn-primary">ログイン</a>
            <a href="${prefix}register.html" class="btn btn-secondary">新規登録</a>
        `;
    }
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
    checkLoginStatus();
    initializePageSpecificBehavior();
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