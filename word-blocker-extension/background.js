chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({
    blacklist: [],
    blockedCount: 0,
    enabled: true
  });
  console.log('Word Blocker installed');
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    // Content script handles blocking automatically
  }
});