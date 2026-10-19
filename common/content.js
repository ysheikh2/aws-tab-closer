// AWS CLI OAuth callback page
if ((window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") &&
    window.location.pathname.startsWith("/oauth/callback") &&
    (document.body.innerText.includes("Request approved") ||
     document.body.innerText.includes("AWS CLI has been given requested permissions") ||
     document.body.innerText.includes("You can now close this tab."))) {
  __BROWSER_API__.runtime.sendMessage("close-tab");
}

// AWS VPN authentication page
if (window.location.host === "127.0.0.1:35001") {
  const successMessages = [
    // AWS VPN Client 6+
    "You may now close this browser tab.", // English
    "Sie können diese Browser-Registerkarte nun schließen.", // German
    "Vous pouvez maintenant fermer cet onglet du navigateur.", // French
    "Ora puoi chiudere questa scheda del browser.", // Italian
    "Ahora puede cerrar esta pestaña del navegador.", // Spanish
    "Agora você pode fechar esta guia do navegador.", // Portuguese (Brazil)
    "これで、このブラウザタブを閉じることができます。", // Japanese
    "이제 이 브라우저 탭을 닫아도 됩니다.", // Korean
    "您现在可以关闭此浏览器选项卡。", // Chinese (Simplified)
    "您現在可以關閉此瀏覽器分頁。", // Chinese (Traditional)
    // AWS VPN Client 5 and older
    "Authentication details received, processing details. You may close this window at any time.", // English
    "Authentifizierungsdetails empfangen, Details werden verarbeitet. Sie können dieses Fenster jederzeit schließen.", // German
    "Otrzymano dane uwierzytelniające, przetwarzamy szczegóły. Możesz zamknąć to okno w dowolnym momencie.", // Polish
    "Informations d'authentification reçues, détails de traitement. Vous pouvez fermer cette fenêtre à tout moment.", // French
    "Dettagli di autenticazione ricevuti, dettagli di elaborazione in corso. Puoi chiudere questa finestra in qualsiasi momento.", // Italian
    "Se recibieron los datos de autenticación y se procesaron. Puede cerrar esta ventana en cualquier momento.", // Spanish
  ];

  // Collapse whitespace so messages match however the page wraps them
  const pageText = () => (document.body ? document.body.innerText : "").replace(/\s+/g, " ");
  const isSuccess = () => successMessages.some(msg => pageText().includes(msg));

  if (isSuccess()) {
    __BROWSER_API__.runtime.sendMessage("close-tab");
  } else {
    // The page may fill in its text after loading, so keep watching for a short while
    const observer = new MutationObserver(() => {
      if (isSuccess()) {
        observer.disconnect();
        __BROWSER_API__.runtime.sendMessage("close-tab");
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    setTimeout(() => observer.disconnect(), 10000);
  }
}
