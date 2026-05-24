chrome.runtime.onInstalled.addListener(() => {
  console.log("SafeHer foi instalada com sucesso.");
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "abrirPopupSafeHer") {
    chrome.action.openPopup();
  }
});