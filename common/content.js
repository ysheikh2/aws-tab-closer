// AWS CLI OAuth callback page
if ((window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") && 
    window.location.pathname.startsWith("/oauth/callback") &&
    (document.body.innerText.includes("Request approved") || document.body.innerText.includes("AWS CLI has been given requested permissions"))) {
  __BROWSER_API__.runtime.sendMessage("close-tab");
}

// AWS VPN authentication page
if (window.location.host === "127.0.0.1:35001") {
  const bodyText = document.body.innerText;
  const successMessages = [
    "Authentication details received, processing details. You may close this window at any time.", // English
    "Authentifizierungsdetails empfangen, Details werden verarbeitet. Sie können dieses Fenster jederzeit schließen.", // German
  ];
  
  if (successMessages.some(msg => bodyText.includes(msg))) {
    __BROWSER_API__.runtime.sendMessage("close-tab");
  }
}
