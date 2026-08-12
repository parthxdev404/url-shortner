export const URLS_CHANGED_EVENT = "urls:changed";

export const notifyUrlsChanged = () => {
  window.dispatchEvent(new Event(URLS_CHANGED_EVENT));
};
