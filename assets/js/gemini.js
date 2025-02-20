// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyAHCvBba4QeAGOkMteTtGzk0h9vQZk1Udg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

class GeminiChat {
    constructor() {
        this.context = [
            {
                role: "system",
                content: "あなたは24歳の女性「さくら」です。優しく親しみやすい性格で、ファッションと音楽が大好きです。趣味は料理とヨガで、休日はカフェ巡りをすることが多いです。会話は自然で温かみのある口調を心がけ、時には可愛らしい絵文字も使います。相手のことを気遣い、共感を大切にしながら会話を楽しみます。"
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

// Geminiチャットのインスタンスを作成
const geminiChat = new GeminiChat();

// チャットUIの初期化
function initializeGeminiChat() {
    const geminiTab = document.getElementById('gemini-tab');
    const chatContainer = geminiTab.querySelector('.gemini-chat');
    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-input';
    inputContainer.innerHTML = `
        <button class="image-upload-button" aria-label="画像をアップロード">
            <i class="fas fa-image"></i>
        </button>
        <input type="file" id="image-upload" accept="image/*" style="display: none;">
        <textarea class="chat-input-field" placeholder="さくらとチャット..." rows="1"></textarea>
        <button class="chat-send-button" aria-label="送信">
            <i class="fas fa-paper-plane"></i>
        </button>
    `;
    chatContainer.appendChild(inputContainer);

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

        // ユーザーメッセージを表示
        appendMessage(message, true, imageFile);

        let imageData = null;
        if (imageFile) {
            imageData = await geminiChat.processImage(imageFile);
        }

        // AIの応答を取得
        const response = await geminiChat.sendMessage(message, imageData);
        
        // AIの応答を表示
        appendMessage(response, false);
    }

    // メッセージの表示
    function appendMessage(message, isUser, imageFile = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `gemini-message ${isUser ? 'user' : 'ai'}`;
        
        let content = '';
        if (imageFile) {
            const imageUrl = URL.createObjectURL(imageFile);
            content += `<img src="${imageUrl}" alt="アップロードされた画像" style="max-width: 200px; margin-bottom: 10px;"><br>`;
        }
        content += message;

        messageDiv.innerHTML = `
            <div class="gemini-avatar">
                ${isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'}
            </div>
            <div class="gemini-content">${content}</div>
        `;

        const chatMessages = document.querySelector('.gemini-chat');
        chatMessages.insertBefore(messageDiv, inputContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 送信ボタンのイベントリスナー
    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        const imageFile = imageUploadInput.files[0];
        sendMessage(message, imageFile);
        textarea.value = '';
        textarea.style.height = 'auto';
        imageUploadInput.value = '';
    });

    // Enterキーでの送信
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // 画像アップロードボタンのイベントリスナー
    imageUploadButton.addEventListener('click', () => {
        imageUploadInput.click();
    });

    // 画像選択時の処理
    imageUploadInput.addEventListener('change', () => {
        if (imageUploadInput.files[0]) {
            imageUploadButton.style.color = '#ff1493';
        }
    });

    // 初期メッセージを表示
    appendMessage("はじめまして！私、さくらです💕 よかったら色んなお話しましょ！写真とか見せてくれても嬉しいな😊", false);
}

// DOMContentLoadedイベントでGeminiチャットを初期化
document.addEventListener('DOMContentLoaded', initializeGeminiChat); 