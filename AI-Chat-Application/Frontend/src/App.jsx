import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { io } from "socket.io-client";
import Markdown from 'react-markdown';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [conversation, setConversation] = useState([]);
  const historyRef = useRef(null);
  const replyTimers = useRef([]);

  const pushMessage = (msg) => {
    setConversation(prev => [...prev, msg]);
  };

  const handleSend = () => {
    const text = message.trim();
    if (text === '') return;

    const userMsg = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    pushMessage(userMsg);
    setWaiting(true);
    socket.emit("ai-content", text);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const socketInstance = io("http://localhost:3000");

    socketInstance.on("connect", () => { });

    socketInstance.on("ai-content-reply", (reply) => {
      const aiMsg = {
        id: Date.now(),
        text: reply,
        sender: 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, aiMsg]);
      setWaiting(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    return () => {
      replyTimers.current.forEach(t => clearTimeout(t));
      replyTimers.current = [];
    };
  }, []);

  return (
    <div className="chat-container" role="region" aria-label="Chat">
      <header className="chat-header">
        <h1>Chat</h1>
      </header>

      <div className="chat-history" ref={historyRef}>
        {conversation.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.sender}`}>
            
            <div className={`chat-message ${msg.sender}`}>
              <div className="message-text">
              {msg.sender === 'other' ? (
                
                <Markdown>{msg.text}</Markdown>
              ):(msg.text)}
              </div>
              <div className="message-time">{msg.time}</div>
            </div>
            {msg.sender === 'user'}
          </div>
        ))}
        {waiting && (
          <div className="message-row other">
            <div className="chat-message other">
              <div class="w-12 text-white-600 h-7"><svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="4" cy="12" r="3"><animate id="spinner_qFRN" begin="0;spinner_OcgL.end+0.25s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"></animate></circle><circle cx="12" cy="12" r="3"><animate begin="spinner_qFRN.begin+0.1s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"></animate></circle><circle cx="20" cy="12" r="3"><animate id="spinner_OcgL" begin="spinner_qFRN.begin+0.2s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"></animate></circle></svg></div>
              
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          aria-label="Message"
        />
        <button className="send-btn" onClick={handleSend} aria-label="Send message">Send</button>
      </div>
    </div>
  );
};

export default App;


// 