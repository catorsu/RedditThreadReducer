const extractBtn = document.getElementById('extractBtn');
const outputTextarea = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const filterRulesDiv = document.getElementById('filterRules');

// Get all controls to listen to
const allControls = [
  ...document.querySelectorAll('input[name="extractionMode"]'),
  ...document.querySelectorAll('input[name="outputFormat"]'),
  document.getElementById('filterDeleted'),
  document.getElementById('filterAutoMod'),
  document.getElementById('minScore')
];

let currentTabUrl = '';
let fullRedditData = null;

// --- Logic Functions ---

// Function: Show or hide filter rules based on extraction mode
function toggleFilterRules() {
  const selectedMode = document.querySelector('input[name="extractionMode"]:checked').value;
  const isSimplifyMode = selectedMode === 'simplify';

  // Ensure the filter rules container is always visible, as per requirements.
  filterRulesDiv.style.display = 'block';

  // Get the filter input elements
  const filterDeletedInput = document.getElementById('filterDeleted');
  const filterAutoModInput = document.getElementById('filterAutoMod');
  const minScoreInput = document.getElementById('minScore');

  // Disable/enable filter controls based on the selected mode.
  // When not in 'simplify' mode (which implies "extract all" or similar), disable the controls.
  if (filterDeletedInput) {
    filterDeletedInput.disabled = !isSimplifyMode;
  }
  if (filterAutoModInput) {
    filterAutoModInput.disabled = !isSimplifyMode;
  }
  if (minScoreInput) {
    minScoreInput.disabled = !isSimplifyMode;
  }

  // Add/remove a class to the container for visual styling of the disabled state.
  // This allows CSS to, for example, gray out the filter section.
  if (isSimplifyMode) {
    filterRulesDiv.classList.remove('filters-disabled');
  } else {
    filterRulesDiv.classList.add('filters-disabled');
  }
}

function isValidRedditPostUrl(url) {
  const pattern = /^https?:\/\/(www\.)?reddit\.com\/r\/[^\/]+\/comments\/[^\/]+/;
  return pattern.test(url);
}

// Core rendering function
function renderOutput() {
  if (!fullRedditData) {
    return;
  }

  // Deep copy full data
  let dataToRender = JSON.parse(JSON.stringify(fullRedditData));

  // Get current UI options
  const selectedMode = document.querySelector('input[name="extractionMode"]:checked').value;
  const outputFormat = document.querySelector('input[name="outputFormat"]:checked').value;
  const filters = {
    hideDeleted: document.getElementById('filterDeleted').checked,
    hideAutoMod: document.getElementById('filterAutoMod').checked,
    minScore: parseInt(document.getElementById('minScore').value, 10) || 0
  };

  // Apply filter if "Simplify" mode is selected
  if (selectedMode === 'simplify') {
    dataToRender.comments = filterComments(dataToRender.comments, filters);
  }

  // Convert processed data to string based on selected format
  let outputString = '';
  if (outputFormat === 'markdown') {
    outputString = convertToMarkdown(dataToRender);
  } else {
    outputString = JSON.stringify(dataToRender, null, 2);
  }

  // Update UI
  outputTextarea.value = outputString;
  copyBtn.disabled = false;
}

// Filtering and conversion logic (moved from background.js)
function filterComments(comments, filters) {
  const filtered = [];
  for (const comment of comments) {
    if (filters.hideDeleted && (comment.author === '[deleted]' || comment.body === '[deleted]' || comment.body === '[removed]')) continue;
    if (filters.hideAutoMod && comment.author === 'AutoModerator') continue;
    if (comment.score < filters.minScore) continue;
    if (comment.replies && comment.replies.length > 0) {
      comment.replies = filterComments(comment.replies, filters);
    }
    filtered.push(comment);
  }
  return filtered;
}

function convertToMarkdown(data) {
  let md = '';
  md += `# ${data.post.title}\n\n`;
  md += `**URL:** [${data.post.url}](${data.post.url})\n`;
  md += `**Author:** ${data.post.author} | **Score:** ${data.post.score}\n\n`;
  if (data.post.text) {
    md += data.post.text.split('\n').map(p => `> ${p}`).join('\n') + '\n\n';
  }
  md += '---\n\n### Comments\n\n';
  md += formatCommentsMarkdown(data.comments, 0);
  return md;
}

function formatCommentsMarkdown(comments, level) {
  let md = '';
  const indent = '    ';
  for (const comment of comments) {
    const prefix = indent.repeat(level) + '*   ';
    md += `${prefix}**${comment.author}** (Score: ${comment.score})\n`;
    if (comment.body) {
      md += comment.body.split('\n').map(line => `${indent.repeat(level)}    > ${line}`).join('\n') + '\n\n';
    }
    if (comment.replies && comment.replies.length > 0) {
      md += formatCommentsMarkdown(comment.replies, level + 1);
    }
  }
  return md;
}

// --- Event Listeners ---

// Simplified function to check current tab
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (currentTabUrl !== tab.url) {
      currentTabUrl = tab.url;
      fullRedditData = null;
      outputTextarea.value = '';
      copyBtn.disabled = true;
    }

    const isButtonEnabled = isValidRedditPostUrl(currentTabUrl);
    extractBtn.disabled = !isButtonEnabled;
    // Reset button text in case it's stuck on "Extraction failed"
    extractBtn.textContent = 'Extract Content';

  } catch (error) {
    console.error('Error checking current tab:', error);
    extractBtn.disabled = true;
    extractBtn.textContent = 'Extract Content';
  }
}

// "Extract Content" button now handles its own status text
extractBtn.addEventListener('click', async () => {
  const originalBtnText = 'Extract Content';
  extractBtn.disabled = true;
  copyBtn.disabled = true;
  outputTextarea.value = '';
  extractBtn.textContent = 'Extracting...';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'fetchRedditData',
      url: currentTabUrl
    });

    if (response.success) {
      fullRedditData = response.data;
      renderOutput();
      extractBtn.textContent = originalBtnText; // Restore text on success
    } else {
      throw new Error(response.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error:', error);
    extractBtn.textContent = 'Extraction Failed'; // Display error on button
    // Restore button text after 3 seconds
    setTimeout(() => {
      if (extractBtn.textContent === 'Extraction Failed') {
        extractBtn.textContent = originalBtnText;
      }
    }, 3000);
  } finally {
    extractBtn.disabled = false; // Re-enable button regardless of success or failure
  }
});

// "Copy" button error handling also updates its own text
copyBtn.addEventListener('click', async () => {
  const originalText = 'Copy to Clipboard';
  try {
    await navigator.clipboard.writeText(outputTextarea.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
    copyBtn.textContent = 'Copy Failed';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  }
});

// Add event listeners for all filter controls
allControls.forEach(control => {
  const eventType = control.type === 'number' ? 'input' : 'change';
  control.addEventListener(eventType, renderOutput);
});

// When mode changes, toggle filter rules visibility in addition to rendering
document.querySelectorAll('input[name="extractionMode"]').forEach(radio => {
  radio.addEventListener('change', toggleFilterRules);
});

// Check URL when browser tab changes/updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    checkCurrentTab();
  }
});

chrome.tabs.onActivated.addListener(() => {
  checkCurrentTab();
});

// Initialization
checkCurrentTab();
toggleFilterRules();
