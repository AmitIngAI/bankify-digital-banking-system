import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Components.module.css';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! 👋 I'm Bankify Assistant. How can I help you today?",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    'Check Balance',
    'Recent Transactions',
    'Block Card',
    'Loan Status',
    'Talk to Agent',
  ];

  const botResponses = {
    'check balance': "Your current account balance is ₹1,50,000. Would you like to see account details?",
    'recent transactions': "Here are your last 3 transactions:\n• ₹500 - Swiggy (Today)\n• ₹2,000 - Amazon (Yesterday)\n• ₹15,000 - Rent Transfer (3 days ago)",
    'block card': "To block your card immediately, please go to Cards section and tap 'Lock Card'. Need help with anything else?",
    'loan status': "Your Personal Loan of ₹5,00,000 is active. EMI of ₹16,500 is due on 15th Feb. Would you like to pay now?",
    'talk to agent': "Connecting you to a live agent... 🔄\n\nOur support team is available 24/7 at:\n📞 1800-123-4567\n📧 support@bankify.com",
    'default': "I understand you need help with that. For detailed assistance, please contact our support team at 1800-123-4567 or visit the Help section.",
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerMsg.includes(key)) {
        return response;
      }
    }
    return botResponses.default;
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      time: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: getBotResponse(text),
      time: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.chatBotInfo}>
          <div className={styles.botAvatar}>🤖</div>
          <div>
            <h3>Bankify Assistant</h3>
            <span className={styles.onlineStatus}>● Online</span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className={styles.chatMessages}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.message} ${styles[msg.type]}`}>
            {msg.type === 'bot' && <div className={styles.msgAvatar}>🤖</div>}
            <div className={styles.msgContent}>
              <p>{msg.text}</p>
              <span className={styles.msgTime}>
                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.message} ${styles.bot}`}>
            <div className={styles.msgAvatar}>🤖</div>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.quickReplies}>
        {quickReplies.map(reply => (
          <button key={reply} onClick={() => handleSend(reply)}>
            {reply}
          </button>
        ))}
      </div>

      <div className={styles.chatInput}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={() => handleSend()} disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22,2 15,22 11,13 2,9"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chatbot;