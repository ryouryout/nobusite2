// モバイルメニューの制御
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeChat();
    initializeScrollBehavior();
    initializeTabs();
});

// ナビゲーション初期化
function initializeNavigation() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    const userSelection = document.querySelector('.user-selection');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            userSelection.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
    }

    // 現在のページのナビゲーションリンクをアクティブに
    const currentPath = window.location.pathname;
    const navLinkElements = document.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        if (link.getAttribute('href').includes(currentPath)) {
            link.classList.add('active');
        }
    });
}

// チャット初期化
function initializeChat() {
    const userCards = document.querySelectorAll('.user-card');
    const chatMessages = document.querySelector('.chat-messages');
    const chatContainer = document.querySelector('.chat-container');
    let currentUser = null;

    // チャット入力フィールドの作成
    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'chat-input';
    chatInputContainer.innerHTML = `
        <input type="text" placeholder="メッセージを入力..." />
        <button type="button">
            <i class="fas fa-paper-plane"></i>
        </button>
    `;
    chatContainer.appendChild(chatInputContainer);

    const chatInput = chatInputContainer.querySelector('input');
    const sendButton = chatInputContainer.querySelector('button');

    // ユーザーカードのクリックイベント
    userCards.forEach(card => {
        card.addEventListener('click', () => {
            userCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentUser = card.dataset.user;
            
            // チャット履歴をクリア
            chatMessages.innerHTML = '';
            
            // 初期メッセージを表示
            appendMessage({
                type: 'received',
                content: getWelcomeMessage(currentUser),
                avatar: card.querySelector('img').src
            });

            // モバイルでユーザー選択を閉じる
            document.querySelector('.user-selection').classList.remove('active');
            document.querySelector('.mobile-menu-button').classList.remove('active');
        });
    });

    // メッセージ送信処理
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message && currentUser) {
            // ユーザーのメッセージを表示
            appendMessage({
                type: 'sent',
                content: message
            });

            // 入力フィールドをクリア
            chatInput.value = '';

            // 返信中のインジケータを表示
            showTypingIndicator();

            // AIの返信を取得（実際のAPIコールはここで行う）
            setTimeout(() => {
                hideTypingIndicator();
                appendMessage({
                    type: 'received',
                    content: getAIResponse(message, currentUser),
                    avatar: document.querySelector(`.user-card[data-user="${currentUser}"] img`).src
                });
            }, 1000 + Math.random() * 1000); // ランダムな遅延を追加
        }
    }

    // Enter キーでメッセージを送信
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 送信ボタンクリックでメッセージを送信
    sendButton.addEventListener('click', sendMessage);

    // メッセージの追加
    function appendMessage({ type, content, avatar }) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type === 'sent' ? 'user' : ''}`;
        
        const timestamp = new Date().toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            ${type === 'received' ? `<img src="${avatar}" class="message-avatar" alt="Avatar">` : ''}
            <div class="message-content">
                <div class="message-bubble">${content}</div>
                <div class="message-time">${timestamp}</div>
            </div>
            ${type === 'sent' ? `<img src="../assets/images/user-avatar.jpg" class="message-avatar" alt="User">` : ''}
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 入力中インジケータの表示
    function showTypingIndicator() {
        const indicatorElement = document.createElement('div');
        indicatorElement.className = 'message';
        indicatorElement.innerHTML = `
            <img src="${document.querySelector(`.user-card[data-user="${currentUser}"] img`).src}" class="message-avatar" alt="Avatar">
            <div class="message-content">
                <div class="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        indicatorElement.id = 'typing-indicator';
        chatMessages.appendChild(indicatorElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 入力中インジケータの非表示
    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // 初期メッセージの取得
    function getWelcomeMessage(user) {
        const messages = {
            mei: 'こんにちは！めいです。趣味や好きなことについて話しましょう！',
            yuki: 'はじめまして、ゆきです。最近見た映画や読んだ本について教えてください。',
            hana: 'こんにちは、はなです。音楽や旅行の話が大好きです！',
            rin: 'りんです！スポーツや健康的な生活について話しませんか？'
        };
        return messages[user] || 'こんにちは！お話しましょう。';
    }

    // AIの返信を生成（実際のAPIレスポンスに置き換える）
    function getAIResponse(message, user) {
        // ここでGemini APIを呼び出す
        return `申し訳ありません。現在APIの接続に問題が発生しています。しばらくしてからもう一度お試しください。`;
    }

    // デフォルトユーザーを選択
    const defaultUser = userCards[0];
    if (defaultUser) {
        defaultUser.click();
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

// Tab functionality
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    function switchTab(tabId) {
        // すべてのタブとコンテンツを非アクティブ化
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // 選択されたタブとコンテンツをアクティブ化
        const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(tabId);
        
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.style.display = 'block';
            setTimeout(() => selectedContent.classList.add('active'), 50);
            
            // URLパラメータを更新
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabId);
            history.replaceState(null, '', url);
        }
    }
    
    // タブクリックイベントの設定
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // URLパラメータからタブを復元
    const urlParams = new URLSearchParams(window.location.search);
    const activeTabId = urlParams.get('tab') || tabs[0]?.getAttribute('data-tab');
    if (activeTabId) {
        switchTab(activeTabId);
    }
} 