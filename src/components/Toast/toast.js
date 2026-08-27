const eventName = "shipops:toast";

export function showToast(message, type = "success") {
  if (!message || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(eventName, { detail: { message, type } }));
}

export { eventName };
