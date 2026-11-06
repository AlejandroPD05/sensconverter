export type Theme = "dark" | "light";

/** Dark is the default; the stored choice only ever switches to light. */
export const DEFAULT_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "sensconverter.theme.v1";

/**
 * Runs in <head> before the first paint so a stored light theme never flashes
 * dark. Static string: no user data is interpolated.
 */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
