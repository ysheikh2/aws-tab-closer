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
    "Otrzymano dane uwierzytelniające, przetwarzamy szczegóły. Możesz zamknąć to okno w dowolnym momencie.", // Polish
    "Informations d'authentification reçues, détails de traitement. Vous pouvez fermer cette fenêtre à tout moment.", // French
    "Dettagli di autenticazione ricevuti, dettagli di elaborazione in corso. Puoi chiudere questa finestra in qualsiasi momento.", // Italian
    "Se recibieron los datos de autenticación y se procesaron. Puede cerrar esta ventana en cualquier momento.", // Spanish
  ];
  
  if (successMessages.some(msg => bodyText.includes(msg))) {
    __BROWSER_API__.runtime.sendMessage("close-tab");
  }
}
