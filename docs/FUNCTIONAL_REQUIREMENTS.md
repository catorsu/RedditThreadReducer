### **Functional Requirements Document (FRD): Reddit Thread Reducer**

**Version:** 1.3 (Revised)

---

#### **1. Overview**

**1.1. Project Goal**
To develop a Chrome browser extension, "Reddit Thread Reducer," that provides a one-click solution to transform the content of a Reddit post page from its raw, complex JSON format into a structured, human-readable output. The extension offers two modes: **"Simplify"** (filters out low-value content) and **"Extract All"** (retrieves all content verbatim).

**1.2. Target Audience**
*   Users who need to quickly extract and archive the core content of Reddit threads.
*   Developers and researchers who use Large Language Models (LLMs) for data analysis or content generation.
*   Any user wishing to consume Reddit discussions in a clean, noise-free format or requiring a complete, unfiltered dataset.

**1.3. Core Value**
The extension streamlines the process of acquiring high-quality, contextual information from Reddit by automating data extraction, filtering, and restructuring. Its key value lies in its **seamless background processing**, allowing users to complete the entire operation without leaving their current page, thus providing a fluid and efficient user experience.

---

#### **2. Core Functionality & Workflow**

**2.1. User Workflow**
1.  The user opens a specific Reddit post page in the Chrome browser.
2.  The user clicks the "Reddit Thread Reducer" icon in the browser toolbar, which **opens a sidebar** on the right side of the browser window.
3.  The user selects the desired extraction mode, **filter rules**, and **output format** from the available options in the sidebar.
4.  The user clicks the **"Extract Content"** button within the sidebar UI.
5.  The extension performs all tasks in the background. The user's main browser page **remains unchanged, with no redirects, refreshes, or flashes**.
6.  After a moment, the processed data appears directly in the sidebar's text area. The sidebar remains open for easy reference.
7.  The user can click the **"Copy to Clipboard"** button to copy the result.

**2.2. System Workflow**
1.  **URL Capture & Validation:** The sidebar script (`sidebar.js`) gets the URL of the current active tab and validates that it is a valid Reddit post URL.
2.  **JSON URL Construction:** The script appends `.json` to the post URL to create the API link for the raw JSON data.
3.  **Background Tab Creation (in `background.js`):** The background script (`background.js`) calls `chrome.tabs.create()` with two key parameters:
    *   `url`: The `.json` link constructed in the previous step.
    *   `active: false`: This is the core of the seamless experience. It instructs the browser to open the link in a **new, non-active (and thus invisible) tab**.
4.  **Content Script Injection & Extraction:**
    *   Once the hidden tab finishes loading, the background script immediately uses `chrome.scripting.executeScript()` to inject a content script into it.
    *   This injected script's sole purpose is to read the page's full text content (`document.body.innerText`), which is the raw JSON string.
5.  **Immediate Cleanup:**
    *   As soon as the JSON string is successfully retrieved, the background script instantly calls `chrome.tabs.remove()` to **close the hidden temporary tab**. This process is typically completed in milliseconds and is imperceptible to the user.
6.  **Data Parsing & Passthrough:**
    *   With the raw JSON string acquired, `background.js` parses it into a standardized JavaScript object (containing the post and a hierarchical comment structure).
    *   This **complete, unfiltered data object** is sent back to `sidebar.js` via the messaging system.
7.  **Local Filtering & Rendering (in `sidebar.js`):**
    *   `sidebar.js` receives and caches this complete, structured data.
    *   It then processes the data **locally** based on the user's real-time selections in the sidebar UI (Simplify/Extract All, filter rules, and output format).
    *   The final, processed string is displayed in the sidebar's text area.

**2.3. Data Transformation Example**

**2.3.1. Sample Input URL (Page user is viewing)**
```
https://www.reddit.com/r/ClaudeAI/comments/1l48ut1/everyone_is_using_mcp_and_claude_code_and_i_am/
```

**2.3.2. Sample Raw JSON Data (Content fetched by the extension in the background)**
*(Note: This is a heavily simplified and truncated example to illustrate the structure.)*
```json
[
  {
    "kind": "Listing",
    "data": {
      "children": [
        {
          "kind": "t3",
          "data": {
            "title": "Everyone is using MCP and Claude Code and I am sitting here...",
            "selftext": "My work uses VPN because our data is proprietary...",
            "url": "https://www.reddit.com/r/ClaudeAI/comments/1l48ut1/everyone_is_using_mcp_and_claude_code_and_i_am/",
            "author": "SomeUser",
            "score": 500
          }
        }
      ]
    }
  },
  {
    "kind": "Listing",
    "data": {
      "children": [
        {
          "kind": "t1",
          "data": { "author": "RedShiftedTime", "score": 152, "body": "Anthropic is THE premier...", "replies": "" }
        },
        {
          "kind": "t1",
          "data": { "author": "[deleted]", "score": -5, "body": "[deleted]", "replies": "" }
        }
      ]
    }
  }
]
```

**2.3.3. Sample Simplified JSON (Final output for "Simplify" mode)**
```json
{
  "post": {
    "title": "Everyone is using MCP and Claude Code and I am sitting here...",
    "text": "My work uses VPN because our data is proprietary...",
    "url": "https://www.reddit.com/r/ClaudeAI/comments/1l48ut1/everyone_is_using_mcp_and_claude_code_and_i_am/",
    "author": "SomeUser",
    "score": 500
  },
  "comments": [
    {
      "author": "RedShiftedTime",
      "score": 152,
      "body": "Anthropic is THE premier...",
      "replies": []
    }
  ]
}
```
*(Note: In "Extract All" mode, the output would also include the comment from `[deleted]`)*

---

#### **3. UI/UX Design**

**3.1. Extension Icon**
*   A clear and intuitive 128x128 pixel icon that represents the concepts of Reddit (e.g., using its orange color palette) and data simplification (e.g., using a funnel or arrow metaphor).

**3.2. Side Panel UI (`sidebar.html`)**
*   **Behavior:** The UI appears in a **native Chrome Side Panel**. It remains open while the user interacts with the main page, allowing for easy reference and copy-pasting of the results.
*   **Dimensions:** The sidebar has a standard width defined by the browser, with its height matching the viewport. Content should be scrollable.
*   **Layout & Components:**
    *   **Title Bar:** The extension's name, "Reddit Thread Reducer," is set via the `<title>` tag in `sidebar.html` and displayed by the browser in the side panel's frame.
    *   **Control Area:**
        *   A **Mode Selection** area with radio buttons:
            *   **"Simplify"**: Filters content (default).
            *   **"Extract All"**: Extracts all content without filtering.
        *   A **Filter Rules** area (`id="filterRules"`) with checkboxes for "Filter Deleted Comments," "**Filter Bot Comments**," and a number input for "Minimum score." This area is **always visible**, but its controls are **enabled only when "Simplify" mode is selected**. When any other mode is active, the controls in this area become disabled and are visually distinct (e.g., grayed out) to indicate they are not applicable.
        *   An **Output Format** area with radio buttons for "JSON" and "Markdown."
        *   A prominent primary button (`id="extractBtn"`) labeled **"Extract Content"**.
    *   **Output Area:**
        *   A read-only, multi-line text box (`id="output"`, `<textarea readonly>`) to display the final result. The text box must have a vertical scrollbar for long content.
        *   A **"Copy to Clipboard"** button (`id="copyBtn"`) located next to or below the text area.
*   **Interaction Logic (`sidebar.js`):**
    *   **Initial State:** Upon opening, the script checks the current page's URL. If it is not a valid Reddit post page, the "Extract Content" button will be disabled.
    *   **On Extract Click:** The button becomes disabled, its text changes to "Extracting...", and any previous output is cleared. A message containing the URL is sent to the background script to initiate the data fetching process.
    *   **On Success:** The button is re-enabled, and its text reverts to its original state. The processed result is displayed in the output area, and the "Copy to Clipboard" button becomes active.
    *   **On Failure:** The button is re-enabled, and its text temporarily displays an error message (e.g., "Extraction Failed"), reverting automatically after a few seconds.

---

#### **4. Technical Requirements & Architecture**

**4.1. Extension Architecture (Manifest V3)**
*   **`manifest.json`:**
    *   `manifest_version`: 3
    *   `permissions`:
        *   `"sidePanel"`: Required to use the Side Panel API.
        *   `"tabs"`: Required to create and close the temporary background tab.
        *   `"scripting"`: Required to inject the content-extraction script into the background tab.
    *   `host_permissions`:
        *   `"*://*.reddit.com/*"`: Explicitly grants permission for the `tabs` and `scripting` APIs to operate on the Reddit domain.
    *   `side_panel`:
        *   `"default_path": "src/sidebar/sidebar.html"`: Specifies the HTML file for the side panel.
    *   `action`: Defines the toolbar icon and title.
    *   `background`: Defines the `service_worker` as `src/background.js`.

*   **`background.js` (Service Worker):**
    *   This script will call `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` once, likely within a `chrome.runtime.onInstalled` listener. This configures the browser to **natively open the side panel** when the user clicks the extension's toolbar icon.
    *   Its primary role is to listen for messages from the sidebar, perform the data fetching and initial parsing via the "Background Tab Method," and return the result.

*   **`sidebar.js` & `sidebar.html`:**
    *   Builds the side panel's user interface and handles all its interactions, including communication with the background script, data filtering, and final output formatting.

**4.2. Data Processing Logic (JavaScript)**
*   The data processing logic is clearly separated into two parts:
    *   **Data Fetching & Initial Parsing (`background.js`):** `background.js` is responsible for receiving a URL, fetching the raw JSON data, and parsing it into a standardized JavaScript object (containing the post and hierarchical comments). It then passes this object to the sidebar. It does not perform any filtering or formatting.
    *   **Data Filtering & Rendering (`sidebar.js`):** `sidebar.js` receives and stores the complete data from the background script. When the user interacts with UI controls (like mode selection or filters), `sidebar.js` applies the corresponding filtering and formatting rules to the complete data locally and updates the output in the text area in real-time. This approach avoids unnecessary network requests and provides a more responsive experience.
*   `sidebar.js` contains a recursive function to correctly process the nested structure of comments and apply filtering rules when required.

**4.3. Output Formatting**
*   In `sidebar.js`, the processed, structured JavaScript object is converted into the desired output format.
*   If the user selects "json", the object is converted to a pretty-printed JSON string.
*   If the user selects "markdown", the object is converted into a human-readable Markdown string, preserving the post and comment hierarchy using Markdown's heading, blockquote, and list syntax.

---

#### **5. Error Handling**

The extension must gracefully handle the following exceptions and provide clear feedback to the user by changing the state of UI controls:

*   **Handles Invalid Pages:** If the user is not on a Reddit post page, the primary action button is disabled.
*   **Handles Tab Creation Failure:** (Rare) Report to the user by changing the state of the primary action button to "Extraction Failed."
*   **Handles Page Load Failure:** If the background tab fails to load the `.json` URL (due to network errors, Reddit server issues, etc.), report: "Failed to fetch data from Reddit. Check your connection or try again."
*   **Handles Script Injection Failure:** (Rare) Report: "Failed to read page content."
*   **Handles JSON Parsing Failure:** If the text retrieved from the page is not valid JSON, report: "Received malformed data from Reddit."
*   **Handles Data Structure Mismatch:** If the JSON structure does not match the expected post/comment format, report: "Could not parse Reddit data structure."

---

#### **6. Security & Permissions**

*   The extension must adhere strictly to the **Principle of Least Privilege**.
*   The `tabs` and `scripting` permissions are narrowly scoped by `host_permissions` to the `*.reddit.com` domain, ensuring the extension cannot and will not interfere with any other websites, thereby protecting user privacy and security.