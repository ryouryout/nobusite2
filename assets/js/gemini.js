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
        this.context = [
            {
                role: "system",
                content: `あなたは${age}歳の女性「${name}」です。${personality}。${interests}について話すのが大好きです。会話は自然で温かみのある口調を心がけ、時には可愛らしい絵文字も使います。相手のことを気遣い、共感を大切にしながら会話を楽しみます。`
            }
        ];
    }

    async sendMessage(message, imageData = null) {
        try {
            let apiUrl = imageData ? GEMINI_VISION_API_URL : GEMINI_API_URL;
            let requestBody;

            if (imageData) {
                requestBody = {
                    contents: [{
                        parts: [
                            { text: message },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: imageData
                                }
                            }
                        ]
                    }]
                };
            } else {
                requestBody = {
                    contents: [{
                        parts: [{ text: message }]
                    }]
                };
            }

            const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error:', error);
            return "ごめんなさい、今ちょっと通信状態が悪いみたい...🙇‍♀️ 後でまた話せたら嬉しいな";
        }
    }

    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// チャットキャラクターの定義
const characters = {
    sakura: new ChatCharacter(
        "さくら",
        24,
        "東京",
        "ファッション、音楽、カフェ巡り",
        "明るく社交的で、おしゃれなことが大好き",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    ),
    hana: new ChatCharacter(
        "はな",
        22,
        "大阪",
        "アート、写真撮影、旅行",
        "アーティスティックで感性豊か、冒険が好き",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9"
    ),
    yuki: new ChatCharacter(
        "ゆき",
        26,
        "札幌",
        "読書、お菓子作り、スノーボード",
        "知的で落ち着いた性格、甘いものが大好き",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
    )
};

let currentCharacter = characters.sakura;

function initializeChat(characterId = 'sakura') {
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

    const textarea = inputContainer.querySelector('.chat-input-field');
    const sendButton = inputContainer.querySelector('.chat-send-button');
    const imageUploadButton = inputContainer.querySelector('.image-upload-button');
    const imageUploadInput = inputContainer.querySelector('#image-upload');

    // 自動リサイズ
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });

    // メッセージ送信
    async function sendMessage(message, imageFile = null) {
        if (!message.trim() && !imageFile) return;

        appendMessage(message, true, imageFile);

        let imageData = null;
        if (imageFile) {
            imageData = await currentCharacter.processImage(imageFile);
        }

        const response = await currentCharacter.sendMessage(message, imageData);
        appendMessage(response, false);
    }

    // メッセージの表示
    function appendMessage(message, isUser, imageFile = null) {
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

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // イベントリスナーの設定
    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        const imageFile = imageUploadInput.files[0];
        sendMessage(message, imageFile);
        textarea.value = '';
        textarea.style.height = 'auto';
        imageUploadInput.value = '';
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    imageUploadButton.addEventListener('click', () => {
        imageUploadInput.click();
    });

    imageUploadInput.addEventListener('change', () => {
        if (imageUploadInput.files[0]) {
            imageUploadButton.style.color = 'var(--color-primary)';
        }
    });

    // 初期メッセージ
    appendMessage(`はじめまして！${currentCharacter.name}です💕 ${currentCharacter.interests}が大好きなの！よかったらお話ししましょう😊`, false);
}

// DOMContentLoadedイベントでチャットを初期化
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('character') || 'sakura';
    initializeChat(characterId);
}); 