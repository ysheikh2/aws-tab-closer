// Runs the built content script against fake page globals. Usage: node --test test/
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../common/content.js", import.meta.url), "utf8").replaceAll("__BROWSER_API__", "api");

function run({ host = "127.0.0.1:35001", hostname = "127.0.0.1", pathname = "/", text = "", laterText }) {
  const sent = [];
  let cb;
  const body = { innerText: text };
  const sandbox = {
    api: { runtime: { sendMessage: m => sent.push(m) } },
    window: { location: { host, hostname, pathname } },
    document: { body, documentElement: {} },
    MutationObserver: class { constructor(f) { cb = f; } observe() {} disconnect() { cb = null; } },
    setTimeout: () => 0,
  };
  vm.runInNewContext(src, sandbox);
  if (laterText !== undefined) { body.innerText = laterText; cb?.(); }
  return sent;
}

const vpn = t => run({ text: t });
test("VPN 6 success closes", () => assert.deepEqual(vpn("Authentication successful\nYou may now close this browser tab."), ["close-tab"]));
test("VPN 6 wrapped across lines closes", () => assert.deepEqual(vpn("You may now close\n  this browser tab."), ["close-tab"]));
test("VPN 6 German closes", () => assert.deepEqual(vpn("Sie können diese Browser-Registerkarte nun schließen."), ["close-tab"]));
test("VPN 5 legacy closes", () => assert.deepEqual(vpn("Authentication details received, processing details. You may close this window at any time."), ["close-tab"]));
test("VPN unrelated page stays", () => assert.deepEqual(vpn("Hello"), []));
test("VPN late-rendered text closes", () => assert.deepEqual(run({ text: "", laterText: "You may now close this browser tab." }), ["close-tab"]));
test("VPN late unrelated text stays", () => assert.deepEqual(run({ text: "", laterText: "nope" }), []));
test("other port ignored", () => assert.deepEqual(run({ host: "127.0.0.1:9999", text: "You may now close this browser tab." }), []));
test("CLI callback closes", () => assert.deepEqual(run({ host: "127.0.0.1:8080", pathname: "/oauth/callback", text: "Request approved" }), ["close-tab"]));
test("CLI wrong path stays", () => assert.deepEqual(run({ host: "127.0.0.1:8080", pathname: "/x", text: "Request approved" }), []));
