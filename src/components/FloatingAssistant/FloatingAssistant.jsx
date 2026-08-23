import { useState } from "react";
import Chatbot from "../../pages/Chatbot/Chatbot";
import "./FloatingAssistant.css";

function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! I can answer general maritime questions and questions about ShipOps data you are allowed to access." },
  ]);
  return (
    <>
      {isOpen && <Chatbot floating onClose={() => setIsOpen(false)} messages={messages} setMessages={setMessages} />}
      <button type="button" className="floating-assistant-button" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"} aria-expanded={isOpen}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a7 7 0 0 0-7 7v3.2a3 3 0 0 0 2 2.8V18a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-2a3 3 0 0 0 2-2.8V10a7 7 0 0 0-7-7Zm-3 8h6M9 14h3" /></svg>
        <span>Ask ShipOps AI</span>
      </button>
    </>
  );
}

export default FloatingAssistant;
