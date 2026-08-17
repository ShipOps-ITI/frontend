import { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! 👋 I'm your AI assistant. How can I help you?"
    }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    // Temporary bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "I'm still connected to the frontend only 🤖"
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="app">
      <div className="chat-container">

        <header className="chat-header">
          <div className="bot-info">
            <div className="bot-avatar">🤖</div>

            <div>
              <h2>AI Assistant</h2>
              <span>● Online</span>
            </div>
          </div>
        </header>

        <main className="messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-row ${message.sender}`}
            >
              {message.sender === "bot" && (
                <div className="message-avatar">🤖</div>
              )}

              <div className="message">
                {message.text}
              </div>

              {message.sender === "user" && (
                <div className="message-avatar">👤</div>
              )}
            </div>
          ))}
        </main>

        <div className="input-container">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={sendMessage}>
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;