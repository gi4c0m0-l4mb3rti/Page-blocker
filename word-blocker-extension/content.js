(function() {
  'use strict';

  if (window.__wordBlockerInjected) return;
  window.__wordBlockerInjected = true;

  var BLOCKED = false;

  function getPageText() {
    var title = document.title || '';
    var metaDesc = '';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) metaDesc = meta.content || '';
    var bodyText = '';
    if (document.body) bodyText = document.body.innerText || document.body.textContent || '';
    return (title + ' ' + metaDesc + ' ' + bodyText).toLowerCase();
  }

  function blockPage(matchedWord) {
    if (BLOCKED) return;
    BLOCKED = true;
    if (document.getElementById('word-blocker-overlay')) return;

    chrome.storage.local.get('blockedCount', function(data) {
      var count = (data.blockedCount || 0) + 1;
      chrome.storage.local.set({ blockedCount: count });
    });

    if (window.stop) window.stop();

    var overlay = document.createElement('div');
    overlay.id = 'word-blocker-overlay';

    var style = document.createElement('style');
    style.textContent = `
      #word-blocker-overlay {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100vw !important; height: 100vh !important;
        background: #0f0f1a !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      #word-blocker-overlay * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .wb-content {
        text-align: center;
        max-width: 500px;
        padding: 40px;
        color: #fff;
      }
      .wb-icon {
        font-size: 64px;
        margin-bottom: 20px;
      }
      .wb-content h1 {
        font-size: 32px;
        margin-bottom: 16px;
        color: #e94560;
        font-weight: 700;
      }
      .wb-content p {
        font-size: 16px;
        color: #aaa;
        margin-bottom: 12px;
        line-height: 1.5;
      }
      .wb-matched {
        display: inline-block;
        background: #e94560;
        color: #fff;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 18px;
        font-weight: 600;
        margin: 16px 0;
      }
      .wb-url {
        font-size: 13px !important;
        color: #666 !important;
        word-break: break-all;
        margin-bottom: 24px !important;
      }
      .wb-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      .wb-buttons button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .wb-back {
        background: #333;
        color: #fff;
      }
      .wb-back:hover { background: #444; }
      .wb-allow {
        background: #e94560;
        color: #fff;
      }
      .wb-allow:hover { background: #c73e54; }
    `;

    overlay.innerHTML = `
      <div class="wb-content">
        <div class="wb-icon">🚫</div>
        <h1>Page Blocked</h1>
        <p>This page contains a blacklisted word:</p>
        <div class="wb-matched">"` + matchedWord.replace(/</g, '&lt;').replace(/"/g, '&quot;') + `"</div>
        <p class="wb-url">` + window.location.href.replace(/</g, '&lt;') + `</p>
        <div class="wb-buttons">
          <button class="wb-back" id="wb-go-back">← Go Back</button>
          <button class="wb-allow" id="wb-allow-once">Allow Once</button>
        </div>
      </div>
    `;

    document.documentElement.innerHTML = '';
    var head = document.createElement('head');
    head.appendChild(style);
    document.documentElement.appendChild(head);
    var body = document.createElement('body');
    body.style.margin = '0';
    body.appendChild(overlay);
    document.documentElement.appendChild(body);

    document.getElementById('wb-go-back').addEventListener('click', function() {
      history.back();
    });

    document.getElementById('wb-allow-once').addEventListener('click', function() {
      chrome.storage.local.set({ allowedOnce: window.location.href }, function() {
        window.location.reload();
      });
    });
  }

  function checkAndBlock() {
    if (BLOCKED) return;

    chrome.storage.local.get(['blacklist', 'enabled', 'allowedOnce'], function(data) {
      if (data.enabled === false) return;
      if (data.allowedOnce === window.location.href) {
        chrome.storage.local.remove('allowedOnce');
        return;
      }

      var blacklist = data.blacklist || [];
      if (blacklist.length === 0) return;

      var pageText = getPageText();

      for (var i = 0; i < blacklist.length; i++) {
        var word = blacklist[i].toLowerCase();
        if (word.length > 0 && pageText.indexOf(word) !== -1) {
          blockPage(blacklist[i]);
          return;
        }
      }
    });
  }

  // Initial check
  checkAndBlock();

  // SPA fix: watch for URL changes (history API) and DOM mutations
  var lastUrl = location.href;

  // Listen for history changes (pushState/replaceState used by YouTube, React, etc.)
  var originalPushState = history.pushState;
  var originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(history, arguments);
    onUrlChange();
  };
  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    onUrlChange();
  };

  window.addEventListener('popstate', onUrlChange);

  function onUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      BLOCKED = false;
      // Small delay to let SPA render new content
      setTimeout(checkAndBlock, 800);
    }
  }

  // Also watch for DOM mutations (content loading dynamically)
  var observerTimeout;
  var observer = new MutationObserver(function() {
    if (BLOCKED) return;
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(checkAndBlock, 500);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

})();