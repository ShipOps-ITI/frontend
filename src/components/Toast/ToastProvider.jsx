import { useEffect, useState } from "react";
import { eventName } from "./toast";
import "./ToastProvider.css";

const DISMISS_AFTER_MS = 4500;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const addToast = (event) => {
      const toast = { id: `${Date.now()}-${Math.random()}`, message: event.detail?.message || "Operation completed.", type: event.detail?.type || "success" };
      setToasts((current) => [...current, toast].slice(-4));
      window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), DISMISS_AFTER_MS);
    };
    window.addEventListener(eventName, addToast);
    return () => window.removeEventListener(eventName, addToast);
  }, []);

  return <>{children}<div className="toast-region" aria-live="polite" aria-atomic="true">
    {toasts.map((toast) => <div className={`toast toast-${toast.type}`} key={toast.id}>
      <span className="toast-icon" aria-hidden="true">{toast.type === "error" ? "!" : ""}</span>
      <p>{toast.message}</p>
      <button className="toast-dismiss" type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification" title="Dismiss notification">&times;</button>
    </div>)}
  </div></>;
}

export default ToastProvider;
