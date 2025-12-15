__BROWSER_API__.runtime.onMessage.addListener((message, sender) => {
  if (message === "close-tab") {
    __BROWSER_API__.tabs.remove(sender.tab.id);
    return Promise.resolve();
  }
  return false;
});
