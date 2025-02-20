// モバイルメニューの制御
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeChat();
    initializeScrollBehavior();
    initializeTabs();
});

function initializeNavigation() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = navLinks.querySelectorAll('.nav-link');
    const body = document.body;

    // オーバーレイ要素の作成
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    body.appendChild(overlay);

    let isMenuOpen = false;

    function openMenu() {
        isMenuOpen = true;
        menuButton.classList.add('active');
        navLinks.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('menu-open');
        
        // アニメーション用のインデックスを設定
        navLinksItems.forEach((link, index) => {
            link.style.setProperty('--index', index);
            link.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    function closeMenu() {
        isMenuOpen = false;
        menuButton.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('menu-open');

        navLinksItems.forEach(link => {
            link.style.transitionDelay = '0s';
        });
    }

    menuButton.addEventListener('click', () => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);
    navLinksItems.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMenu();
            }
        }, 250);
    });
}

function initializeChat() {
    const textarea = document.querySelector('.chat-input-field');
    const chatMessages = document.querySelector('.chat-messages');
    const sendButton = document.querySelector('.chat-send-button');
    const backButton = document.querySelector('.back-button');
    const userSelection = document.querySelector('.user-selection');
    const userCards = document.querySelectorAll('.user-card');
    const tabs = document.querySelectorAll('.tab');

    if (textarea) {
        // メッセージ入力欄の自動リサイズ
        function adjustTextareaHeight() {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }

        textarea.addEventListener('input', adjustTextareaHeight);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // 初期の高さを設定
        adjustTextareaHeight();
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            userSelection.classList.add('active');
        });
    }

    userCards.forEach(card => {
        card.addEventListener('click', () => {
            userCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            userSelection.classList.remove('active');
            
            // ユーザー情報の更新
            updateChatHeader(card);
        });
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    function sendMessage() {
        const message = textarea.value.trim();
        if (!message) return;

        const time = new Date().toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const messageHTML = `
            <div class="message message-sent">
                <div class="message-content">
                    <p>${escapeHTML(message)}</p>
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;

        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
        textarea.value = '';
        adjustTextareaHeight();
        scrollToBottom();
    }

    function updateChatHeader(card) {
        const chatHeader = document.querySelector('.chat-header');
        const avatar = card.querySelector('.user-avatar').cloneNode(true);
        const name = card.querySelector('.user-name').textContent;
        const status = card.querySelector('.user-status').textContent;

        chatHeader.querySelector('.user-avatar').replaceWith(avatar);
        chatHeader.querySelector('.user-name').textContent = name;
        chatHeader.querySelector('.user-status').textContent = status;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

function initializeScrollBehavior() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > scrollThreshold) {
            header.classList.add('header-scrolled');
            
            if (currentScroll > lastScrollTop) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
        } else {
            header.classList.remove('header-scrolled', 'header-hidden');
        }
        
        lastScrollTop = currentScroll;
    });

    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

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

function initializeTabs() {
    const tabContainers = document.querySelectorAll('.tabs-container');
    
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');
        
        // 最初のタブをアクティブにする
        if (tabs.length > 0 && !container.querySelector('.tab.active')) {
            tabs[0].classList.add('active');
            const targetId = tabs[0].getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        }
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // タブの切り替え
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // コンテンツの切り替え
                const targetId = tab.getAttribute('data-tab');
                contents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = 'block';
                    setTimeout(() => {
                        targetContent.classList.add('active');
                    }, 50);
                }
                
                // スクロール位置の調整
                if (window.innerWidth <= 768) {
                    const tabsScroll = container.querySelector('.tabs');
                    const tabLeft = tab.offsetLeft;
                    const tabWidth = tab.offsetWidth;
                    const scrollLeft = tabsScroll.scrollLeft;
                    const containerWidth = tabsScroll.offsetWidth;
                    
                    const targetScrollLeft = tabLeft - (containerWidth - tabWidth) / 2;
                    tabsScroll.scrollTo({
                        left: targetScrollLeft,
                        behavior: 'smooth'
                    });
                }
                
                // URLパラメータの更新
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('tab', targetId);
                const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                history.replaceState(null, '', newUrl);
            });
        });
    });
    
    // URLパラメータからタブを復元
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        const tab = document.querySelector(`[data-tab="${tabParam}"]`);
        if (tab) {
            tab.click();
        }
    }
} 