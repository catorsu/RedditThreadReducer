// src/background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
  console.log('Reddit Thread Reducer extension installed and side panel behavior set.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchRedditData') {
    fetchAndStructureRedditThread(request.url)
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function fetchAndStructureRedditThread(url) {
  if (!isValidRedditPostUrl(url)) {
    throw new Error('Invalid Reddit post URL');
  }

  const jsonUrl = url.replace(/\/?$/, '') + '.json';

  try {
    const tab = await chrome.tabs.create({ url: jsonUrl, active: false });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error('Timeout loading Reddit data'));
      }, 10000);

      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          clearTimeout(timeout);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });

    try {
      await chrome.tabs.remove(tab.id);
    } catch (e) {
      console.error('Failed to close tab:', e);
    }

    if (!results || !results[0] || !results[0].result) {
      throw new Error('Failed to read page content');
    }

    const rawJson = results[0].result;
    let data;

    try {
      data = JSON.parse(rawJson);
    } catch (e) {
      throw new Error('Received malformed data from Reddit');
    }

    const processedData = processRedditData(data);

    return processedData;

  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Failed to fetch data from Reddit. Please check your network connection or try again.');
    }
    throw error;
  }
}

function isValidRedditPostUrl(url) {
  const pattern = /^https?:\/\/(www\.)?reddit\.com\/r\/[^\/]+\/comments\/[^\/]+/;
  return pattern.test(url);
}

function processRedditData(data) {
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error('Could not parse Reddit data structure');
  }

  const postData = data[0]?.data?.children?.[0]?.data;
  const commentsData = data[1]?.data?.children || [];

  if (!postData) {
    throw new Error('Could not parse Reddit data structure');
  }

  const structuredData = {
    post: {
      title: postData.title || '',
      text: postData.selftext || '',
      url: postData.url || '',
      author: postData.author || '[deleted]',
      score: postData.score || 0
    },
    comments: processComments(commentsData)
  };

  return structuredData;
}

function processComments(comments) {
  const processedComments = [];

  for (const comment of comments) {
    // Skip 'more' type objects
    if (comment.kind !== 't1' || !comment.data) continue;

    const data = comment.data;

    const processedComment = {
      author: data.author || '[deleted]',
      score: data.score || 0,
      body: data.body || '[deleted]',
      replies: []
    };

    if (data.replies && data.replies.data && data.replies.data.children) {
      processedComment.replies = processComments(data.replies.data.children);
    }

    processedComments.push(processedComment);
  }

  return processedComments;
}
