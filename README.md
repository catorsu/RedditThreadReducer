# Reddit Thread Reducer

A Chrome extension that transforms Reddit post pages into clean, structured data with powerful filtering options.

## Features

- **One-click extraction** - Extract Reddit thread content directly from any post page
- **Dual extraction modes**:
  - **Simplify**: Filters out low-value content (deleted comments, bots, heavily downvoted)
  - **Extract All**: Retrieves complete thread data without filtering
- **Multiple output formats**:
  - **JSON**: Structured, hierarchical data format
  - **Markdown**: Human-readable formatted text
- **Real-time filtering** - Adjust filters and see results instantly without re-fetching
- **Dark theme UI** - Easy on the eyes during extended use
- **Seamless experience** - Works in a sidebar without disrupting your browsing

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The Reddit Thread Reducer icon will appear in your Chrome toolbar

## Usage

1. Navigate to any Reddit post page
2. Click the Reddit Thread Reducer icon in your toolbar
3. A sidebar will open on the right side of your browser
4. Choose your extraction mode and output format
5. Click "Extract Content"
6. Copy the results with the "Copy to Clipboard" button

## Filter Options (Simplify Mode)

- **Filter Deleted Comments**: Remove [deleted] comments
- **Filter Bot Comments**: Remove AutoModerator and bot posts
- **Minimum Score**: Hide comments below a score threshold

## Output Formats

### JSON Format
```json
{
  "post": {
    "title": "Post title",
    "text": "Post content",
    "url": "https://reddit.com/...",
    "author": "username",
    "score": 123
  },
  "comments": [
    {
      "author": "commenter",
      "score": 45,
      "text": "Comment text",
      "replies": [...]
    }
  ]
}
```

### Markdown Format
```markdown
# Post Title

**Author:** username | **Score:** 123

Post content here...

## Comments

### commenter (45 points)
Comment text...

#### replier (12 points)
Reply text...
```

## Technical Details

- Built with Chrome Extension Manifest V3
- Uses Chrome Side Panel API for non-intrusive UI
- Fetches data via Reddit's JSON API
- Client-side filtering for instant results
- No external dependencies

## Permissions

- `tabs`: To access the current tab's URL
- `scripting`: To extract JSON data from Reddit
- `sidePanel`: To display the extension UI
- `*://*.reddit.com/*`: To access Reddit content

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.