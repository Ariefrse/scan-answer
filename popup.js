document.getElementById('scanButton').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "scanText"});
    window.close();
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "textSelected") {
    getAIResponse(request.text);
  }
});

function getAIResponse(text) {
  // Replace with actual AI API call
  fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      prompt: text,
      max_tokens: 100
    })
  })
  .then(response => response.json())
  .then(data => {
    chrome.storage.local.set({result: data.choices[0].text}, function() {
      chrome.browserAction.setBadgeText({text: "!"});
    });
  })
  .catch(error => {
    console.error('Error:', error);
    chrome.storage.local.set({result: "Error: Could not get AI response"});
  });
}

// Display result when popup opens
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['result'], function(data) {
    if (data.result) {
      document.getElementById('result').innerText = data.result;
      chrome.browserAction.setBadgeText({text: ""});
    }
  });
});