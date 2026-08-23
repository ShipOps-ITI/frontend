import { useState } from "react";
import { askAssistant } from "../../services/chat.service";
import "./Chatbot.css";

function Chatbot({ floating = false, onClose, messages: externalMessages, setMessages: setExternalMessages }) {
  const [internalMessages, setInternalMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! I can answer general maritime questions and questions about ShipOps data you are allowed to access." },
  ]);
  const messages = externalMessages ?? internalMessages;
  const setMessages = setExternalMessages ?? setInternalMessages;
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
    <div className={floating ? "chatbot-modal" : "chatbot-page"} role={floating ? "dialog" : undefined} aria-modal={floating || undefined} aria-label={floating ? "ShipOps AI assistant" : undefined}>
      <div className="chatbot-container">
        <header className="chatbot-header">
          <div className="bot-info">
            <div className="bot-avatar">🤖</div>
            <div><h2>AI Assistant</h2><span>Online</span></div>
          </div>
          {floating && <button type="button" className="chatbot-close" onClick={onClose} aria-label="Collapse AI assistant" title="Collapse assistant">−</button>}
        </header>

        <main className="chatbot-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.sender}`}>
              {message.sender === "bot" && <div className="message-avatar">🤖</div>}
              <div className="message">{message.text}</div>
              {message.sender === "user" && <div className="message-avatar">👤</div>}
            </div>
          ))}
        </main>

        <div className="chatbot-input-container">
          <input
            type="text"
            placeholder="Ask about ShipOps or general maritime logistics..."
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
