const extractBtn = document.getElementById('extractBtn');
const statusDiv = document.getElementById('status');
const outputTextarea = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const infoMessage = document.getElementById('infoMessage');

let currentTabUrl = '';

async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTabUrl = tab.url;
    
    if (!isValidRedditPostUrl(currentTabUrl)) {
      extractBtn.disabled = true;
      infoMessage.textContent = 'Please navigate to a Reddit post to use this extension';
      infoMessage.style.display = 'block';
      statusDiv.textContent = '';
    } else {
      extractBtn.disabled = false;
      infoMessage.style.display = 'none';
      statusDiv.textContent = 'Ready';
    }
  } catch (error) {
    console.error('Error checking current tab:', error);
    extractBtn.disabled = true;
  }
}

function isValidRedditPostUrl(url) {
  const pattern = /^https?:\/\/(www\.)?reddit\.com\/r\/[^\/]+\/comments\/[^\/]+/;
  return pattern.test(url);
}

function updateStatus(message, type = '') {
  statusDiv.textContent = message;
  statusDiv.className = type;
}

extractBtn.addEventListener('click', async () => {
  extractBtn.disabled = true;
  copyBtn.disabled = true;
  outputTextarea.value = '';
  updateStatus('Extracting...', '');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'extractAndSimplify',
      url: currentTabUrl
    });
    
    if (response.success) {
      outputTextarea.value = response.data;
      copyBtn.disabled = false;
      updateStatus('Success!', 'success');
    } else {
      updateStatus(response.error || 'An error occurred', 'error');
    }
  } catch (error) {
    updateStatus('Failed to communicate with extension', 'error');
    console.error('Error:', error);
  } finally {
    extractBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputTextarea.value);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
    updateStatus('Failed to copy to clipboard', 'error');
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    checkCurrentTab();
  }
});

chrome.tabs.onActivated.addListener(() => {
  checkCurrentTab();
});

checkCurrentTab();