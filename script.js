// 模組資訊定義
const moduleInfo = {
    empathy: {
        title: '同理心實驗室 - Empathy Lab',
        description: '建構使用者觀點，深入理解需求',
        features: '此功能幫助您深入了解目標用戶的需求、痛點和期望。透過AI輔助的觀點分析，建立多元化的用戶畫像，為後續的設計決策提供堅實的基礎。',
        details: '包含用戶訪談指導、需求分析、情境洞察等功能。'
    },
    define: {
        title: '問題定義生成器 - HMW Generator',
        description: '將需求轉換為可行的設計挑戰',
        features: '此功能將您觀察到的用戶需求轉換為「How Might We」格式的設計挑戰。AI會幫助您重新框架問題，找出關鍵的設計機會點。',
        details: '自動生成多角度的HMW問題，協助聚焦設計方向。'
    },
    ideate: {
        title: '創意發想風暴 - Idea Stormer',
        description: '激發創新思維，產生多樣化解決方案',
        features: '此功能結合SCAMPER創意技法與AI智能提示，幫助您突破思維框架，產生豐富多樣的創意解決方案。支援多輪迭代優化。',
        details: '提供創意激發、方案評估、概念發展等完整流程。'
    },
    prototype: {
        title: '原型建構器 - Prototype Builder',
        description: '快速建立概念原型與視覺化',
        features: '此功能協助您將創意想法具體化為可視的原型。結合AI圖像生成和描述優化，快速產出概念草圖、介面描述和互動流程。',
        details: '包含概念圖生成、介面設計建議、使用流程規劃等功能。'
    },
    track: {
        title: '互動歷程追蹤 - Interaction Tracker',
        description: '記錄並分析設計思維歷程',
        features: '此功能自動記錄您在各個設計階段的互動過程，提供歷程可視化分析。幫助您回顧設計決策，優化創作流程。',
        details: '提供歷程回顧、決策分析、流程優化建議等功能。'
    }
};

// 後端 API 網址
const API_BASE_URL = 'https://codesign-api-360608791019.asia-east1.run.app';

// DOM 元素
let currentModule = null;
let currentSessionId = null;
const moduleButtons = document.querySelectorAll('.module-btn');
const chatMessages = document.getElementById('chatMessages');
const currentModuleTitle = document.getElementById('current-module');
const moduleDescription = document.getElementById('module-description');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const themeButtons = document.querySelectorAll('.theme-btn');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 載入儲存的主題
    loadSavedTheme();
    
    // 為每個模組按鈕添加點擊事件
    moduleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleKey = this.getAttribute('data-module');
            selectModule(moduleKey);
        });
    });

    // 主題切換事件
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            switchTheme(theme);
        });
    });

    // 發送按鈕事件
    sendButton.addEventListener('click', function() {
        if (!sendButton.disabled && currentModule) {
            sendMessage();
        }
    });

    // 輸入框按鍵事件
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled && currentModule) {
                sendMessage();
            }
        }
    });
});

// 主題切換功能
function switchTheme(theme) {
    // 更新按鈕狀態
    themeButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    
    // 應用主題
    document.body.setAttribute('data-theme', theme);
    
    // 保存主題偏好
    localStorage.setItem('codesign-theme', theme);
    
    // 添加切換動畫效果
    document.body.style.transition = 'all 0.3s ease';
}

// 載入儲存的主題
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('codesign-theme') || 'warm';
    switchTheme(savedTheme);
}

// 獲取或建立 Session ID
function getSessionId() {
    if (!currentSessionId) {
        currentSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('codesign-session', currentSessionId);
    }
    return currentSessionId;
}

// 選擇模組功能
function selectModule(moduleKey) {
    // 更新按鈕狀態
    moduleButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-module="${moduleKey}"]`).classList.add('active');
    
    // 更新當前模組
    currentModule = moduleKey;
    const module = moduleInfo[moduleKey];
    
    // 更新標題和描述
    currentModuleTitle.textContent = module.title;
    moduleDescription.textContent = module.description;
    
    // 如果是 Empathy Lab，啟用真實功能
    if (moduleKey === 'empathy') {
        initializeEmpathyLab();
    } else {
        // 其他模組顯示開發中
        showDevelopmentMessage(module);
    }
}

// 初始化 Empathy Lab
function initializeEmpathyLab() {
    // 清空對話區域
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <div class="message-content">
                <h3>🎭 同理心實驗室</h3>
                <p>歡迎來到同理心實驗室！我是您的用戶體驗研究助手。</p>
                <p>我可以幫助您深入了解目標用戶的需求、痛點和期望，建立用戶畫像和情境分析。</p>
                <p>請告訴我您想要分析的用戶問題或情境！</p>
            </div>
        </div>
    `;
    
    // 啟用輸入功能
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.placeholder = '描述您想要分析的用戶問題...';
    messageInput.focus();
}

// 發送訊息到 AI
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentModule) return;
    
    // 顯示用戶訊息
    addMessage(message, true);
    messageInput.value = '';
    
    // 顯示載入狀態
    showLoadingMessage();
    
    try {
        // 發送到後端 API
        const response = await fetch(`${API_BASE_URL}/api/chat/${currentModule}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: getSessionId(),
                message: message
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 移除載入訊息並顯示 AI 回應
        removeLoadingMessage();
        addMessage(result.response, false);
        
    } catch (error) {
        console.error('Error sending message:', error);
        removeLoadingMessage();
        addMessage('抱歉，發生了錯誤。請稍後再試。', false, true);
    }
}

// 添加訊息到聊天區域
function addMessage(content, isUser = false, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isError) {
        messageContent.style.backgroundColor = 'var(--accent-light)';
        messageContent.style.color = 'var(--accent-primary)';
        messageContent.style.border = '1px solid var(--accent-primary)';
    }
    
    messageContent.textContent = content;
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 顯示載入訊息
function showLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message ai-message loading-message';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <div class="loading-indicator">
                <span>AI 正在思考中</span>
                <div class="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 移除載入訊息
function removeLoadingMessage() {
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// 選擇模組功能
function selectModule(moduleKey) {
    // 更新按鈕狀態
    moduleButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-module="${moduleKey}"]`).classList.add('active');
    
    // 更新當前模組
    currentModule = moduleKey;
    const module = moduleInfo[moduleKey];
    
    // 更新標題和描述
    currentModuleTitle.textContent = module.title;
    moduleDescription.textContent = module.description;
    
    // 顯示開發中訊息
    showDevelopmentMessage(module);
    
    // 暫時保持輸入框禁用狀態
    // messageInput.disabled = false;
    // sendButton.disabled = false;
    // messageInput.placeholder = `在 ${module.title} 中輸入訊息...`;
}

// 顯示開發中訊息
function showDevelopmentMessage(module) {
    const messageHtml = `
        <div class="development-message">
            <div class="dev-content">
                <div class="module-title">${module.title}</div>
                <div class="dev-status">🚧 功能開發中</div>
                <div class="feature-description">
                    <strong>功能介紹：</strong>${module.features}
                    <br><br>
                    <strong>主要特色：</strong>${module.details}
                    <br><br>
                    <em>此功能正在積極開發中，敬請期待完整版本的發布！</em>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.innerHTML = messageHtml;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 發送訊息功能（預留）
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentModule) {
        // 這裡之後會實作真正的AI對話功能
        console.log(`發送到 ${currentModule}: ${message}`);
        messageInput.value = '';
    }
}

// 添加訊息到聊天區域（預留）
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'ai-message';
    messageDiv.innerHTML = content;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 重置到歡迎畫面
function resetToWelcome() {
    currentModule = null;
    currentModuleTitle.textContent = '歡迎使用 CoDesignAI';
    moduleDescription.textContent = '請選擇左側的設計思維模組開始使用';
    
    // 移除所有按鈕的活動狀態
    moduleButtons.forEach(btn => btn.classList.remove('active'));
    
    // 顯示歡迎訊息
    const welcomeHtml = `
        <div class="welcome-message">
            <div class="message-content">
                <h3>🎨 歡迎來到 CoDesignAI</h3>
                <p>這是一個專為大學生設計的AI輔助創作系統，結合設計思維流程，幫助您更好地完成專題創作。</p>
                <p>請點擊左側的模組開始探索各個功能！</p>
            </div>
        </div>
    `;
    
    chatMessages.innerHTML = welcomeHtml;
    
    // 禁用輸入
    messageInput.disabled = true;
    sendButton.disabled = true;
    messageInput.placeholder = '輸入訊息...';
}