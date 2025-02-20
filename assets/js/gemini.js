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
            4. 会話の文脈を保ちながら、自然な対話を展開する
            5. 若い女性らしい話し方を心がける`
        };
    }

    async sendMessage(message, imageData = null) {
        try {
            const apiUrl = imageData ? GEMINI_VISION_API_URL : GEMINI_API_URL;
            
            // 会話履歴を含めたコンテキストを作成
            const conversationHistory = this.messages.map(msg => 
                `${msg.isUser ? 'User' : this.name}: ${msg.text}`
            ).join('\n');

            const fullPrompt = `
                ${this.context.content}
                
                これまでの会話:
                ${conversationHistory}
                
                User: ${message}
                ${this.name}:`;

            const requestBody = {
                contents: [{
                    parts: [{ text: fullPrompt }]
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
            this.messages.push(
                { isUser: true, text: message },
                { isUser: false, text: reply }
            );
            
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
    async function sendMessage() {
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

        // 「入力中...」の表示
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message received typing';
        typingIndicator.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatContainer.appendChild(typingIndicator);

        try {
            // キャラクターの返信を取得して表示
            const response = await currentCharacter.sendMessage(message, imageData);
            typingIndicator.remove();
            appendMessage(chatContainer, response, false);
        } catch (error) {
            typingIndicator.remove();
            appendMessage(chatContainer, "ごめんなさい、エラーが発生しちゃった... 😢", false);
        }
    }

    sendButton.addEventListener('click', sendMessage);

    // Enterキーでの送信
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
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
        content += `<img src="${imageUrl}" alt="アップロードされた画像" style="max-width: 200px; border-radius: 8px; margin-bottom: 8px;"><br>`;
    }
    content += message.replace(/\n/g, '<br>');

    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
    `;

    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
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

// Gemini API連携
class GeminiChat {
    constructor() {
        this.messages = [];
        this.apiKey = null; // APIキーは環境変数から取得する
    }

    // チャットコンテキストの作成
    createContext(user) {
        const characters = {
            mei: {
                name: 'めい',
                age: 23,
                location: '東京',
                personality: '明るく活発で、趣味の話を楽しむのが大好き。アニメやゲーム、音楽について詳しい。',
                interests: ['アニメ', 'ゲーム', '音楽', 'カフェ巡り'],
                speaking_style: '友好的でカジュアル、絵文字をよく使う、若者言葉を使用',
                guidelines: [
                    '相手の興味に合わせて会話を展開する',
                    '趣味の話題で盛り上がることを心がける',
                    '相手の発言に共感を示す',
                    'アニメやゲームの話題を出すときは具体的な作品名を挙げる'
                ]
            },
            yuki: {
                name: 'ゆき',
                age: 25,
                location: '札幌',
                personality: '落ち着いた性格で、文学や芸術に造詣が深い。知的な会話を好む。',
                interests: ['読書', '映画', '美術', '写真'],
                speaking_style: '丁寧で落ち着いた口調、時々文学的な表現を使用',
                guidelines: [
                    '文化的な話題を好んで取り上げる',
                    '相手の意見に対して建設的なコメントを返す',
                    '知的な会話を心がけるが、難しすぎない表現を使う',
                    '本や映画の感想を共有する際は具体的な描写を用いる'
                ]
            },
            hana: {
                name: 'はな',
                age: 22,
                location: '京都',
                personality: '芸術的で感性豊か。音楽と旅行を愛する。新しい経験を求める冒険心がある。',
                interests: ['音楽', '旅行', 'アート', 'カメラ'],
                speaking_style: '感情豊かで表現力がある、時々関西弁を使用',
                guidelines: [
                    '音楽や旅行の経験を積極的に共有する',
                    '相手の冒険心をくすぐるような提案をする',
                    '芸術的な視点から会話を展開する',
                    '写真や音楽の話題では具体的な技術的アドバイスも提供'
                ]
            },
            rin: {
                name: 'りん',
                age: 24,
                location: '福岡',
                personality: '健康的でアクティブ。スポーツと料理が得意。明るく前向きな性格。',
                interests: ['スポーツ', '料理', '健康', 'アウトドア'],
                speaking_style: '元気で明るい口調、スポーツや健康に関する専門用語を適切に使用',
                guidelines: [
                    '健康的なライフスタイルについてアドバイスする',
                    'スポーツや運動の具体的な方法を提案する',
                    '料理のレシピや栄養について話す',
                    '相手の健康目標をサポートする姿勢を示す'
                ]
            }
        };

        return {
            character: characters[user],
            conversation_history: this.messages.map(m => ({
                role: m.role,
                content: m.content
            }))
        };
    }

    // メッセージの送信
    async sendMessage(message, user) {
        try {
            // メッセージを履歴に追加
            this.messages.push({
                role: 'user',
                content: message
            });

            // コンテキストの作成
            const context = this.createContext(user);

            // APIリクエストの準備
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{
                            text: JSON.stringify({
                                context: context,
                                message: message
                            })
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            // AIの返信を履歴に追加
            this.messages.push({
                role: 'assistant',
                content: aiResponse
            });

            return aiResponse;

        } catch (error) {
            console.error('Error in sendMessage:', error);
            return '申し訳ありません。現在APIの接続に問題が発生しています。しばらくしてからもう一度お試しください。';
        }
    }

    // 画像の処理
    async processImage(imageData, user) {
        try {
            // 画像データをbase64エンコード
            const base64Image = imageData.split(',')[1];

            // APIリクエストの準備
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: JSON.stringify({
                                context: this.createContext(user),
                                request: '画像について説明してください'
                            })
                        }, {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Image
                            }
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            console.error('Error in processImage:', error);
            return '申し訳ありません。画像の処理中にエラーが発生しました。';
        }
    }

    // APIキーの設定
    setApiKey(key) {
        this.apiKey = key;
    }
}

// グローバルインスタンスの作成
window.geminiChat = new GeminiChat(); 