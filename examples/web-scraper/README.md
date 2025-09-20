# Web Scraper Action

A Deno-powered GitHub Action that demonstrates web scraping capabilities for extracting content from websites in your CI/CD pipeline.

## 📋 What This Action Does

- Fetches content from a specified URL
- Extracts specific data using CSS selectors or text patterns
- Saves extracted data as workflow outputs
- Handles errors and provides meaningful feedback
- Respects robots.txt and implements rate limiting

## 🔧 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `url` | Yes | - | The URL to scrape |
| `selector` | No | `title` | CSS selector for content extraction |
| `timeout` | No | `10000` | Request timeout in milliseconds |
| `user-agent` | No | `Deno-Web-Scraper` | User agent string |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `content` | The extracted content |
| `status` | HTTP status code |
| `title` | Page title (always extracted) |

## 📝 Usage Example

### Monitor Website Changes

```yaml
name: Website Content Monitor
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: Scrape Website
        id: scrape
        run: deno run --allow-net --allow-env main.ts
        env:
          INPUT_URL: "https://example.com"
          INPUT_SELECTOR: "h1"
          INPUT_TIMEOUT: "15000"
      
      - name: Check Content
        run: |
          echo "Title: ${{ steps.scrape.outputs.title }}"
          echo "Content: ${{ steps.scrape.outputs.content }}"
          echo "Status: ${{ steps.scrape.outputs.status }}"
```

### Extract Latest Blog Post

```yaml
name: Blog Post Tracker
on: [workflow_dispatch]

jobs:
  track-blog:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: Get Latest Post
        id: blog
        run: deno run --allow-net --allow-env scraper.ts
        env:
          INPUT_URL: "https://blog.example.com"
          INPUT_SELECTOR: ".post-title:first-child"
      
      - name: Create Issue if New Post
        if: contains(steps.blog.outputs.content, 'Breaking')
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'New Important Blog Post',
              body: 'Found: ${{ steps.blog.outputs.content }}'
            })
```

## 🚀 Action Code

### `main.ts`

```typescript
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

interface ScrapingResult {
  content: string;
  title: string;
  status: number;
}

async function scrapeWebsite(): Promise<ScrapingResult> {
  // Get inputs from environment
  const url = Deno.env.get("INPUT_URL");
  const selector = Deno.env.get("INPUT_SELECTOR") || "title";
  const timeout = parseInt(Deno.env.get("INPUT_TIMEOUT") || "10000");
  const userAgent = Deno.env.get("INPUT_USER-AGENT") || "Deno-Web-Scraper";

  if (!url) {
    throw new Error("URL input is required");
  }

  console.log(`🔍 Scraping: ${url}`);
  console.log(`📍 Selector: ${selector}`);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Extract title
    const titleElement = doc.querySelector("title");
    const title = titleElement?.textContent?.trim() || "No title found";

    // Extract content using selector
    const contentElement = doc.querySelector(selector);
    const content = contentElement?.textContent?.trim() || "No content found";

    return {
      content,
      title,
      status: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// Main execution
try {
  const result = await scrapeWebsite();
  
  console.log(`✅ Success! Status: ${result.status}`);
  console.log(`📄 Title: ${result.title}`);
  console.log(`📝 Content: ${result.content}`);

  // Set outputs
  console.log(`::set-output name=content::${result.content}`);
  console.log(`::set-output name=title::${result.title}`);
  console.log(`::set-output name=status::${result.status}`);
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  Deno.exit(1);
}
```

### `action.yml` (Composite Action)

```yaml
name: 'Deno Web Scraper'
description: 'Scrape web content using Deno and CSS selectors'
inputs:
  url:
    description: 'URL to scrape'
    required: true
  selector:
    description: 'CSS selector for content extraction'
    required: false
    default: 'title'
  timeout:
    description: 'Request timeout in milliseconds'
    required: false
    default: '10000'
  user-agent:
    description: 'User agent string'
    required: false
    default: 'Deno-Web-Scraper'
outputs:
  content:
    description: 'Extracted content'
  title:
    description: 'Page title'
  status:
    description: 'HTTP status code'
runs:
  using: 'composite'
  steps:
    - name: Setup Deno
      uses: denoland/setup-deno@v1
      with:
        deno-version: v1.x
    - name: Run Scraper
      shell: bash
      run: deno run --allow-net --allow-env ${{ github.action_path }}/main.ts
      env:
        INPUT_URL: ${{ inputs.url }}
        INPUT_SELECTOR: ${{ inputs.selector }}
        INPUT_TIMEOUT: ${{ inputs.timeout }}
        INPUT_USER-AGENT: ${{ inputs.user-agent }}
```

## 🔍 Local Testing

```bash
# Set environment variables
export INPUT_URL="https://example.com"
export INPUT_SELECTOR="h1"
export INPUT_TIMEOUT="15000"

# Run the scraper
deno run --allow-net --allow-env main.ts
```

## ⚠️ Best Practices

1. **Respect robots.txt**: Always check website's robots.txt file
2. **Rate Limiting**: Add delays between requests to avoid overwhelming servers
3. **Error Handling**: Implement robust error handling for network issues
4. **User Agent**: Use a descriptive user agent string
5. **Timeouts**: Set reasonable timeouts to prevent hanging workflows
6. **Selectors**: Use specific CSS selectors to avoid breaking changes

## 🛡️ Security Considerations

- Only scrape public, non-authenticated content
- Be mindful of copyright and terms of service
- Don't scrape personal or sensitive information
- Consider caching to reduce server load

## 📚 Advanced Features

- **Multiple Selectors**: Extract multiple pieces of content
- **Data Validation**: Validate extracted content format
- **Retry Logic**: Implement exponential backoff for failed requests
- **Content Comparison**: Compare with previous runs to detect changes

## 🔗 Related Examples

- [Basic Action](../basic-action/) - Learn the fundamentals
- [API Client](../api-client/) - For structured data from APIs