export const getRuntimeEnv = (name, fallback = "") => {
  const runtimeValue = window._env?.[name];

  if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
    return runtimeValue;
  }

  return import.meta.env[name] || fallback;
};
