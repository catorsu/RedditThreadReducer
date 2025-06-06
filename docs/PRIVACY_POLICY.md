# Privacy Policy for Reddit Thread Reducer

**Last Updated:** June 6, 2025

Thank you for choosing Reddit Thread Reducer. This Privacy Policy is intended to help you understand what data our extension accesses, and what it does with that data.

Our core philosophy is to be as privacy-respecting as possible. **Reddit Thread Reducer does not collect, store, transmit, or sell any of your personal data or browsing activity.**

---

### 1. What is Reddit Thread Reducer?

Reddit Thread Reducer is a browser extension designed to help users, developers, and researchers easily extract and reformat content from public Reddit post pages. It transforms the raw JSON data of a Reddit thread into a clean, structured, and human-readable format (either JSON or Markdown) directly within a browser side panel.

---

### 2. Permissions and Data Usage

To provide its functionality, Reddit Thread Reducer requires a limited set of permissions. Here is a detailed explanation of why each permission is necessary and how it is used:

#### **`host_permissions` for `*://*.reddit.com/*`**

*   **Purpose:** This is the core permission that allows the extension to function. It grants the extension the ability to interact **only with pages on the reddit.com domain**.
*   **Usage:**
    1.  When you are on a Reddit post page and activate the extension, it appends `.json` to the current URL to access Reddit's public JSON API for that specific post.
    2.  The extension opens this `.json` URL in a temporary, hidden background tab to read the publicly available thread data (post content and comments).
*   **Data Accessed:** The extension only reads the publicly available text content of the Reddit post and its comments. It does not access your Reddit account information, private messages, or any other non-public data.

#### **`tabs`**

*   **Purpose:** This permission is required to manage browser tabs for the extension's core operation.
*   **Usage:**
    1.  **To identify the current page:** The extension uses this permission to get the URL of your active tab to confirm that you are on a valid Reddit post page before enabling its features.
    2.  **For background processing:** It is used to create a new, non-active (hidden) tab to load the `.json` data from Reddit. This tab is closed immediately after the data is retrieved. This entire process is designed to be seamless and not interrupt your browsing session.

#### **`scripting`**

*   **Purpose:** This permission allows the extension to inject a script into the hidden tab.
*   **Usage:** After the hidden tab loads the `.json` data from Reddit, a script is injected to read the page's text content (the raw JSON string). This is the sole method used to retrieve the data. The script is not injected into any other pages or for any other purpose.

#### **`sidePanel`**

*   **Purpose:** This permission is required to display the extension's user interface.
*   **Usage:** It allows the extension to open and manage its user interface (mode selection, filter rules, output area) in the browser's native side panel, providing a convenient and non-intrusive user experience.

---

### 3. Data We Do NOT Collect

To be perfectly clear, Reddit Thread Reducer **DOES NOT**:

*   Track your browsing history on any website.
*   Collect, store, or transmit any personally identifiable information (PII) such as your name, email address, IP address, or location.
*   Access or interact with your Reddit user account, cookies, or authentication tokens.
*   Send any data from your browser to our servers. The extension operates entirely on your local machine. All data processing happens locally within your browser.

---

### 4. Data Storage

Reddit Thread Reducer does not have a backend server and does not store any user data remotely. The only data "stored" is the structured content from a Reddit thread, which is held temporarily in the sidebar's text area for you to view and copy. This data is discarded as soon as you close the sidebar or navigate to a new page.

---

### 5. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.

---

### 6. Contact Us

If you have any questions about this Privacy Policy, please feel free to open an issue on our GitHub repository.

[https://github.com/catorsu/RedditThreadReducer](https://github.com/catorsu/RedditThreadReducer)