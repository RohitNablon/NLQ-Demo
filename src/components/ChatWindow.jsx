import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

const sampleQuestions = [
    "What are the top selling categories by revenue?",
    "Which city has the most stores?",
    "Show me the total sales for Dim_Store 2106.",
    "List top 5 vendors by sale amount.",
    "What's the average bottle volume for Irish Whiskies?",
    "Show monthly sales trend for 2015.",
];

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text) => {
        const messageText = text || inputValue.trim();
        if (!messageText) return;

        // Add user message
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), type: 'user', content: messageText },
        ]);
        setInputValue('');
        setIsTyping(true);

        // Simulate agent response
        setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    type: 'agent',
                    content: generateMockResponse(messageText),
                },
            ]);
        }, 1500);
    };

    const generateMockResponse = (query) => {
        const responses = {
            'categories': 'Based on Fact_Sales, the top selling categories are:\n\n• Irish Whiskies: $4,560,230\n• Straight Bourbon Whiskies: $3,892,100\n• Canadian Whiskies: $2,567,800\n• Vodka 80 Proof: $2,123,400\n\nIrish Whiskies lead in total revenue.',
            'city': 'The cities with the most stores are:\n\n• Des Moines: 85 stores\n• Cedar Rapids: 54 stores\n• Davenport: 42 stores\n• Waterloo: 38 stores',
            '2106': 'Store 2106 (Hillstreet News and Tobacco) had a total sale amount of $1,245,678 for the reported period, with 12,456 bottles sold.',
            'vendors': 'Here are the top 5 vendors by sale amount:\n\n1. DIAGEO AMERICAS - $8,245,000\n2. PERNOD RICARD USA - $5,198,000\n3. SAZERAC COMPANY  - $4,167,000\n4. JIM BEAM BRANDS - $3,145,000\n5. LUXCO SPIRITS - $2,132,000',
            'irish whiskies': 'For Irish Whiskies, the average bottle volume is 745ml. Most products are in the 750ml or 1000ml range.',
            'trend': 'The sales trend for 2015 show steady growth:\n\n• Q1: $12.4M\n• Q2: $14.2M\n• Q3: $15.8M\n• Q4: $19.5M (Peak during Holiday season)',
        };

        const lowerQuery = query.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (lowerQuery.includes(key)) {
                return response;
            }
        }

        return "I've analyzed your query. Based on the database schema, I found relevant information. Please refine your question for more specific results.";
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-window">
            <div className="messages-area">
                {messages.length === 0 ? (
                    <div className="welcome-message">
                        <div className="welcome-icon">Q</div>
                        <h2 className="welcome-title">Start a Conversation</h2>
                        <p className="welcome-subtitle">
                            Ask questions about your data in plain English
                        </p>
                        <div className="sample-questions">
                            {sampleQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    className="sample-question"
                                    onClick={() => handleSend(question)}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div key={message.id} className={`message ${message.type}`}>
                                <div className="message-avatar">
                                    {message.type === 'user' ? 'U' : 'A'}
                                </div>
                                <div className="message-content">
                                    {message.content.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < message.content.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message agent">
                                <div className="message-avatar">A</div>
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="input-area">
                <div className="input-container">
                    <textarea
                        className="chat-input"
                        placeholder="Ask a question about your data..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />
                    <button
                        className="send-btn"
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isTyping}
                    >
                        <span>Send</span>
                        <span>-&gt;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
