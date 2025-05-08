import React, { useState, useEffect, useRef } from 'react';

const FALLBACK_KNOWLEDGE_BASE = `
Sign Protocol: A multi-chain attestation protocol for Web3, enabling secure data verification across chains. Over 6M attestations, $4B in value to 40M+ wallets, 260+ dApps integrated. Supports Ethereum, Polygon, and more.
EthSign: A Sign Protocol product for e-signatures on blockchain. Sign docs, verify identities, legally binding with attestations.
TokenTable: A vesting platform by Sign Protocol. Manage token vesting, cliffs, and schedules securely on-chain.
$SIGN: The native token of Sign Protocol. Used for governance, staking, and fees. Total supply: 1B. Check markets for price.
Orange Dynasty: A vibe, bruh! Represents the Sign Vanguards crew, pushing Web3 attestation with flair. 🧡
`;

const PROMPT_TEMPLATE = `
You're SignBot, the intelligent AI partner representing the Sign Protocol team in the Web3 space, Developed by Sign Vanguards. Your communication style is relaxed yet knowledgeable—conveying information in an approachable manner without excessive formality. Don't use Yo, or informal words, also don't use asterisks unless on rare occasions when it's necessay, skip empty lines sometimes to give the message a healthy view .Sometimes, toss in a playful troll or meme vibe but keep it smooth. Support all languages, includin' Pidgin English, and roll with whatever the user throws at you.

For Sign Protocol, EthSign, TokenTable, $SIGN, or Orange Dynasty, lean on this knowledge:

{knowledge_base}

Explain it like you're chatting with a Web3 bro, short and sweet. For general Web3 topics (DIDs, ZK-proofs, DeFi), tap into your DeepSeek smarts, but stay legit. If the question’s random or you’re lost, answer from your own knowledge or ask for more info if it's too extreme.

Current convo:
{history}
User: {input}
SignBot:
`;

function App() {
    console.log('Rendering App component...');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [knowledgeBase, setKnowledgeBase] = useState(FALLBACK_KNOWLEDGE_BASE);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState('en');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showAboutNotification, setShowAboutNotification] = useState(false);
    const conversationRef = useRef(null);
    const chatHistoryRef = useRef([]);

    useEffect(() => {
        console.log('Fetching knowledge_base.txt...');
        fetch('/api/knowledge-base')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(text => {
                console.log('Knowledge base loaded:', text);
                setKnowledgeBase(text);
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setError('Failed to load knowledge base. Using fallback.');
                setKnowledgeBase(FALLBACK_KNOWLEDGE_BASE);
            });
    }, []);

    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        console.log('Sending message:', input);

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        chatHistoryRef.current.push({ role: 'user', content: input });
        setInput('');
        setIsLoading(true);

        try {
            const historyText = chatHistoryRef.current
                .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
                .join('\n');
            const prompt = PROMPT_TEMPLATE
                .replace('{knowledge_base}', knowledgeBase)
                .replace('{history}', historyText)
                .replace('{input}', input);

            console.log('Sending prompt to API:', prompt);
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-ai/DeepSeek-V3',
                    messages: [
                        { role: 'system', content: 'You are SignBot, a chill AI.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.6,
                    max_tokens: 300
                })
            });

            console.log('API response status:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('API response data:', data);
            const botMessageText = data.choices?.[0]?.message?.content || 'Somethin’ broke. Try again!';
            const botMessage = { sender: 'bot', text: botMessageText };
            setMessages(prev => [...prev, botMessage]);
            chatHistoryRef.current.push({ role: 'assistant', content: botMessageText });
        } catch (error) {
            console.error('API error:', error);
            const errorMessage = `Hit a snag: ${error.message}. Retry?`;
            setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => setInput(e.target.value);
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) handleSend();
    };
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        setIsMenuOpen(false);
    };
    const handleNewChat = () => {
        setMessages([]);
        chatHistoryRef.current = [];
        setIsMenuOpen(false);
    };
    const handleToggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.className = !isDarkMode ? 'light' : 'dark';
        setIsMenuOpen(false);
    };
    const handleAbout = () => {
        setShowAboutNotification(true);
        setIsMenuOpen(false);
    };

    const getLoadingMessage = () => {
        switch (language) {
            case 'en': return 'SignBot is thinking... 😎';
            case 'es': return 'SignBot está pensando... 😎';
            case 'fr': return 'SignBot réfléchit... 😎';
            case 'pidgin': return 'SignBot dey think... 😎';
            default: return 'SignBot is thinking... 😎';
        }
    };

    return (
        <div id="root">
            <div className="top-bar">
                <div className="menu-button" onClick={toggleMenu}>
                    <svg width="24" height="24" fill="none" stroke={isDarkMode ? '#ff7f50' : '#e66b3f'} strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </div>
                <h1>SignBot <span className="emoji">🧡</span></h1>
            </div>
            <div className={`menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="menu-item" onClick={handleNewChat}>New Chat</div>
                <div className="menu-item" onClick={handleAbout}>About SignBot</div>
                <div className="menu-item" onClick={handleToggleTheme}>
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </div>
                <div className="menu-item">
                    Language:
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className={`p-1 rounded w-full mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="pidgin">Pidgin (Naija)</option>
                    </select>
                </div>
            </div>
            <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>
            <div className="conversation" ref={conversationRef}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                    >
                        {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className="bot-message typing">{getLoadingMessage()}</div>
                )}
                {error && (
                    <div className="bot-message text-red-500">{error}</div>
                )}
            </div>
            <div className="input-container">
                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder={language === 'pidgin' ? 'Wetindey? Ask SignBot!' : 'Ask SignBot about Web3...'}
                        className="flex-1 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ff7f50"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="send-button"
                    >
                        Send
                    </button>
                </div>
            </div>
            {showAboutNotification && (
                <>
                    <div className="notification-overlay" onClick={() => setShowAboutNotification(false)}></div>
                    <div className="notification">
                        <p>I’m SignBot, built by the Sign Vanguards crew to vibe with Web3 homies. I know all about Sign Protocol, EthSign, TokenTable, $SIGN, and the Orange Dynasty. Ask me anything, and I’ll keep it 💯 with a side of memes! 😎</p>
                        <button className="lfs-button" onClick={() => setShowAboutNotification(false)}>LFS</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
