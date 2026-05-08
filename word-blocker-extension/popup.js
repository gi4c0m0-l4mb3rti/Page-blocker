document.addEventListener('DOMContentLoaded', function() {
  var blacklistInput = document.getElementById('blacklist');
  var saveBtn = document.getElementById('saveBtn');
  var clearBtn = document.getElementById('clearBtn');
  var status = document.getElementById('status');
  var wordCount = document.getElementById('wordCount');
  var blockedCount = document.getElementById('blockedCount');
  var enabledToggle = document.getElementById('enabledToggle');

  function showStatus(message, isError) {
    status.textContent = message;
    status.className = 'status ' + (isError ? 'error' : 'success');
    setTimeout(function() {
      status.className = 'status';
    }, 3000);
  }

  function updateStats() {
    var words = blacklistInput.value.split('\n').map(function(w) { return w.trim(); }).filter(function(w) { return w.length > 0; });
    wordCount.textContent = words.length;
  }

  // Load saved data
  chrome.storage.local.get(['blacklist', 'blockedCount', 'enabled'], function(data) {
    if (data.blacklist && data.blacklist.length > 0) {
      blacklistInput.value = data.blacklist.join('\n');
    }
    enabledToggle.checked = (data.enabled !== false);
    blockedCount.textContent = data.blockedCount || 0;
    updateStats();
  });

  saveBtn.addEventListener('click', function() {
    var rawText = blacklistInput.value;
    var words = rawText.split('\n').map(function(w) { return w.trim(); }).filter(function(w) { return w.length > 0; });
    var uniqueWords = [];
    words.forEach(function(w) {
      if (uniqueWords.indexOf(w) === -1) uniqueWords.push(w);
    });

    chrome.storage.local.set({ blacklist: uniqueWords }, function() {
      updateStats();
      showStatus('Saved ' + uniqueWords.length + ' word(s)!');
    });
  });

  clearBtn.addEventListener('click', function() {
    if (confirm('Clear entire blacklist?')) {
      blacklistInput.value = '';
      chrome.storage.local.set({ blacklist: [] }, function() {
        updateStats();
        showStatus('Blacklist cleared!');
      });
    }
  });

  enabledToggle.addEventListener('change', function() {
    chrome.storage.local.set({ enabled: enabledToggle.checked }, function() {
      showStatus(enabledToggle.checked ? 'Enabled!' : 'Disabled!');
    });
  });

  blacklistInput.addEventListener('input', updateStats);
});