import { useState } from "react";
import { askAssistant } from "../../services/chat.service";
import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! I'm your ShipOps assistant. Ask me about data you are allowed to access." },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isSending) return;

    setMessages((current) => [...current, { id: Date.now(), sender: "user", text: question }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await askAssistant(question);
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        sender: "bot",
        text: response.data.answer,
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        sender: "bot",
        text: error.response?.data?.message || "I couldn't reach the assistant. Please try again.",
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <header className="chat-header">
          <div className="bot-info">
            <div className="bot-avatar">🤖</div>
            <div><h2>AI Assistant</h2><span>● Online</span></div>
          </div>
        </header>

        <main className="messages">
          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.sender}`}>
              {message.sender === "bot" && <div className="message-avatar">🤖</div>}
              <div className="message">{message.text}</div>
              {message.sender === "user" && <div className="message-avatar">👤</div>}
            </div>
          ))}
        </main>

        <div className="input-container">
          <input
            type="text"
            placeholder="Ask about shipments, ships, fleets, ports, or companies..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && sendMessage()}
            disabled={isSending}
          />
          <button onClick={sendMessage} disabled={isSending}>{isSending ? "Thinking..." : "Send"}</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
