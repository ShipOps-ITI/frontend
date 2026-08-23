// Runtime environment getter: prefers window._env (injected at container start)
export function getEnv(key) {
  try {
    if (typeof window !== 'undefined' && window._env && window._env[key] !== undefined) {
      return window._env[key];
    }
  } catch {
    // ignore
  }
  return import.meta.env[key];
}

export default getEnv;
