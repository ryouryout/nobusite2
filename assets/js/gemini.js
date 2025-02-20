// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyAHCvBba4QeAGOkMteTtGzk0h9vQZk1Udg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

class ChatCharacter {
    constructor(name, age, location, interests, personality, imageUrl) {
        this.name = name;
        this.age = age;
        this.location = location;
        this.interests = interests;
        this.personality = personality;
        this.imageUrl = imageUrl;
        this.messages = [];
        this.context = this.createContext();
    }

    createContext() {
        return {
            role: "system",
            content: `あなたは${this.age}歳の女性「${this.name}」として振る舞います。
            プロフィール:
            - 住所: ${this.location}
            - 性格: ${this.personality}
            - 興味: ${this.interests}
            
            以下の特徴を持って会話してください：
            1. 自然な口調で話し、時には絵文字も使用
            2. 相手の興味や話題に共感を示す
            3. ${this.name}の個性や興味に基づいた返答をする
            4. 会話の文脈を保ちながら、自然な対話を展開する`
        };
    }

    async sendMessage(message, imageData = null) {
        try {
            const apiUrl = imageData ? GEMINI_VISION_API_URL : GEMINI_API_URL;
            
            // 会話履歴を含めたコンテキストを作成
            const conversationContext = this.messages.map(msg => ({
                role: msg.isUser ? "user" : "assistant",
                content: msg.text
            }));

            const requestBody = {
                contents: [{
                    parts: [
                        { text: this.context.content + "\n\n" + message }
                    ]
                }]
            };

            if (imageData) {
                requestBody.contents[0].parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: imageData
                    }
                });
            }

            const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            const reply = data.candidates[0].content.parts[0].text;
            
            // 会話履歴を更新
            this.messages.push({ isUser: false, text: reply });
            return reply;

        } catch (error) {
            console.error('Error:', error);
            return `ごめんなさい、今ちょっと調子が悪いみたい...🙇‍♀️ また後でお話しできたら嬉しいな`;
        }
    }

    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// チャットキャラクター定義
const characters = {
    mei: new ChatCharacter(
        "めい",
        23,
        "東京・渋谷",
        "ファッション、カフェ巡り、写真撮影",
        "明るく社交的、トレンドに敏感",
        "/assets/images/mei.jpg"
    ),
    yuki: new ChatCharacter(
        "ゆき",
        25,
        "札幌",
        "アウトドア、料理、温泉",
        "落ち着いた性格、自然が大好き",
        "/assets/images/yuki.jpg"
    ),
    hana: new ChatCharacter(
        "はな",
        22,
        "京都",
        "伝統文化、抹茶、着物",
        "優雅で知的、和の文化に詳しい",
        "/assets/images/hana.jpg"
    ),
    rin: new ChatCharacter(
        "りん",
        24,
        "福岡",
        "音楽、ライブ、カラオケ",
        "活発で情熱的、音楽が生きがい",
        "/assets/images/rin.jpg"
    )
};

let currentCharacter = null;

function initializeChat(characterId) {
    if (!characters[characterId]) {
        console.error('Character not found:', characterId);
        return;
    }

    currentCharacter = characters[characterId];
    const chatContainer = document.querySelector('.chat-messages');
    if (!chatContainer) return;

    // チャットUIの初期化
    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-input';
    inputContainer.innerHTML = `
        <button class="image-upload-button" aria-label="画像をアップロード">
            <i class="fas fa-image"></i>
        </button>
        <input type="file" id="image-upload" accept="image/*" style="display: none;">
        <textarea class="chat-input-field" placeholder="${currentCharacter.name}とチャット..." rows="1"></textarea>
        <button class="chat-send-button" aria-label="送信">
            <i class="fas fa-paper-plane"></i>
        </button>
    `;

    chatContainer.parentElement.appendChild(inputContainer);

    // 各種イベントリスナーの設定
    setupEventListeners(chatContainer, inputContainer);

    // キャラクターの初期メッセージを表示
    displayWelcomeMessage(chatContainer);
}

function setupEventListeners(chatContainer, inputContainer) {
    const textarea = inputContainer.querySelector('.chat-input-field');
    const sendButton = inputContainer.querySelector('.chat-send-button');
    const imageUploadButton = inputContainer.querySelector('.image-upload-button');
    const imageUploadInput = inputContainer.querySelector('#image-upload');

    // テキストエリアの自動リサイズ
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });

    // メッセージ送信
    sendButton.addEventListener('click', async () => {
        const message = textarea.value.trim();
        const imageFile = imageUploadInput.files[0];
        
        if (!message && !imageFile) return;

        // ユーザーメッセージを表示
        appendMessage(chatContainer, message, true, imageFile);
        textarea.value = '';
        textarea.style.height = 'auto';
        imageUploadInput.value = '';
        imageUploadButton.style.color = '';

        // 画像処理
        let imageData = null;
        if (imageFile) {
            imageData = await currentCharacter.processImage(imageFile);
        }

        // キャラクターの返信を取得して表示
        const response = await currentCharacter.sendMessage(message, imageData);
        appendMessage(chatContainer, response, false);
    });

    // Enterキーでの送信
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // 画像アップロード
    imageUploadButton.addEventListener('click', () => {
        imageUploadInput.click();
    });

    imageUploadInput.addEventListener('change', () => {
        if (imageUploadInput.files[0]) {
            imageUploadButton.style.color = 'var(--color-primary)';
        }
    });
}

function appendMessage(container, message, isUser, imageFile = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'sent' : 'received'}`;
    
    let content = '';
    if (imageFile) {
        const imageUrl = URL.createObjectURL(imageFile);
        content += `<img src="${imageUrl}" alt="アップロードされた画像"><br>`;
    }
    content += message;

    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
    `;

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;

    // 会話履歴を更新
    currentCharacter.messages.push({ isUser, text: message });
}

function displayWelcomeMessage(container) {
    const welcomeMessage = `こんにちは！${currentCharacter.name}です💕\n${currentCharacter.interests}が大好きなの！\nよかったらお話ししましょう😊`;
    appendMessage(container, welcomeMessage, false);
}

// キャラクター選択時の処理
function selectCharacter(characterId) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('character', characterId);
    history.replaceState(null, '', `?${urlParams.toString()}`);
    
    // チャット画面をクリアして再初期化
    const chatContainer = document.querySelector('.chat-messages');
    const inputContainer = document.querySelector('.chat-input');
    if (chatContainer) {
        chatContainer.innerHTML = '';
        inputContainer?.remove();
    }
    
    initializeChat(characterId);
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('character') || 'mei';
    initializeChat(characterId);
    
    // キャラクター選択UIのイベントリスナー設定
    document.querySelectorAll('.user-card').forEach(card => {
        card.addEventListener('click', () => {
            const characterId = card.getAttribute('data-user');
            selectCharacter(characterId);
        });
    });
}); 