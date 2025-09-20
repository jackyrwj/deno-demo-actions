# API Client Action

A Deno-powered GitHub Action for interacting with external APIs, demonstrating authentication, data processing, and error handling in CI/CD workflows.

## 📋 What This Action Does

- Makes authenticated requests to external APIs
- Processes JSON responses and handles various data formats
- Implements retry logic and error handling
- Supports multiple authentication methods (Bearer token, API key, Basic auth)
- Validates responses and provides detailed outputs

## 🔧 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-url` | Yes | - | The API endpoint URL |
| `method` | No | `GET` | HTTP method (GET, POST, PUT, DELETE) |
| `auth-type` | No | `bearer` | Authentication type (bearer, apikey, basic, none) |
| `auth-token` | No | - | Authentication token/key |
| `headers` | No | `{}` | Additional headers (JSON format) |
| `body` | No | - | Request body (for POST/PUT requests) |
| `timeout` | No | `30000` | Request timeout in milliseconds |
| `retry-count` | No | `3` | Number of retry attempts |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `response` | The API response body |
| `status` | HTTP status code |
| `success` | Whether the request was successful (true/false) |
| `headers` | Response headers (JSON format) |

## 📝 Usage Examples

### Fetch GitHub Repository Info

```yaml
name: Repository Stats
on: [workflow_dispatch]

jobs:
  fetch-stats:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: Get Repository Stats
        id: repo-stats
        run: deno run --allow-net --allow-env api-client.ts
        env:
          INPUT_API-URL: "https://api.github.com/repos/denoland/deno"
          INPUT_METHOD: "GET"
          INPUT_AUTH-TYPE: "bearer"
          INPUT_AUTH-TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Display Results
        run: |
          echo "Status: ${{ steps.repo-stats.outputs.status }}"
          echo "Stars: $(echo '${{ steps.repo-stats.outputs.response }}' | jq .stargazers_count)"
```

### Post to Slack Webhook

```yaml
name: Deployment Notification
on:
  push:
    branches: [main]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: Send Slack Notification
        id: slack
        run: deno run --allow-net --allow-env api-client.ts
        env:
          INPUT_API-URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          INPUT_METHOD: "POST"
          INPUT_AUTH-TYPE: "none"
          INPUT_HEADERS: '{"Content-Type": "application/json"}'
          INPUT_BODY: '{"text": "🚀 Deployment completed for ${{ github.repository }}"}'
      
      - name: Check Notification
        if: steps.slack.outputs.success == 'true'
        run: echo "✅ Slack notification sent successfully"
```

### Weather API Integration

```yaml
name: Daily Weather Report
on:
  schedule:
    - cron: '0 8 * * *'  # Every day at 8 AM

jobs:
  weather:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: Fetch Weather Data
        id: weather
        run: deno run --allow-net --allow-env api-client.ts
        env:
          INPUT_API-URL: "https://api.openweathermap.org/data/2.5/weather?q=London&appid=${{ secrets.WEATHER_API_KEY }}"
          INPUT_METHOD: "GET"
          INPUT_AUTH-TYPE: "none"
          INPUT_RETRY-COUNT: "5"
      
      - name: Process Weather Data
        run: |
          TEMP=$(echo '${{ steps.weather.outputs.response }}' | jq '.main.temp')
          echo "Temperature in London: ${TEMP}K"
```

## 🚀 Action Code

### `api-client.ts`

```typescript
interface APIClientConfig {
  url: string;
  method: string;
  authType: string;
  authToken?: string;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
  retryCount: number;
}

interface APIResponse {
  response: any;
  status: number;
  success: boolean;
  headers: Record<string, string>;
}

class APIClient {
  private config: APIClientConfig;

  constructor(config: APIClientConfig) {
    this.config = config;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private prepareHeaders(): Headers {
    const headers = new Headers(this.config.headers);

    switch (this.config.authType.toLowerCase()) {
      case 'bearer':
        if (this.config.authToken) {
          headers.set('Authorization', `Bearer ${this.config.authToken}`);
        }
        break;
      case 'apikey':
        if (this.config.authToken) {
          headers.set('X-API-Key', this.config.authToken);
        }
        break;
      case 'basic':
        if (this.config.authToken) {
          const encoded = btoa(this.config.authToken);
          headers.set('Authorization', `Basic ${encoded}`);
        }
        break;
    }

    return headers;
  }

  private async makeRequest(attempt: number = 1): Promise<APIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      console.log(`🔄 Attempt ${attempt}/${this.config.retryCount + 1}: ${this.config.method} ${this.config.url}`);

      const requestInit: RequestInit = {
        method: this.config.method,
        headers: this.prepareHeaders(),
        signal: controller.signal,
      };

      if (this.config.body && ['POST', 'PUT', 'PATCH'].includes(this.config.method.toUpperCase())) {
        requestInit.body = this.config.body;
      }

      const response = await fetch(this.config.url, requestInit);
      clearTimeout(timeoutId);

      // Convert response headers to object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: any;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const result: APIResponse = {
        response: responseData,
        status: response.status,
        success: response.ok,
        headers: responseHeaders,
      };

      if (response.ok) {
        console.log(`✅ Success! Status: ${response.status}`);
        return result;
      } else {
        console.log(`⚠️  HTTP ${response.status}: ${response.statusText}`);
        if (attempt <= this.config.retryCount) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.makeRequest(attempt + 1);
        }
        return result;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`⏰ Request timeout after ${this.config.timeout}ms`);
      } else {
        console.error(`❌ Network error: ${error.message}`);
      }

      if (attempt <= this.config.retryCount) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await this.sleep(delay);
        return this.makeRequest(attempt + 1);
      }

      throw error;
    }
  }

  async execute(): Promise<APIResponse> {
    return this.makeRequest();
  }
}

// Parse inputs from environment variables
function parseConfig(): APIClientConfig {
  const url = Deno.env.get("INPUT_API-URL");
  if (!url) {
    throw new Error("api-url input is required");
  }

  const method = Deno.env.get("INPUT_METHOD") || "GET";
  const authType = Deno.env.get("INPUT_AUTH-TYPE") || "none";
  const authToken = Deno.env.get("INPUT_AUTH-TOKEN");
  const timeout = parseInt(Deno.env.get("INPUT_TIMEOUT") || "30000");
  const retryCount = parseInt(Deno.env.get("INPUT_RETRY-COUNT") || "3");
  const body = Deno.env.get("INPUT_BODY");

  let headers: Record<string, string> = {};
  const headersInput = Deno.env.get("INPUT_HEADERS");
  if (headersInput) {
    try {
      headers = JSON.parse(headersInput);
    } catch (error) {
      console.warn(`⚠️  Invalid headers JSON: ${error.message}`);
    }
  }

  return {
    url,
    method: method.toUpperCase(),
    authType,
    authToken,
    headers,
    body,
    timeout,
    retryCount,
  };
}

// Main execution
try {
  const config = parseConfig();
  const client = new APIClient(config);
  const result = await client.execute();

  console.log(`📊 Final Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  
  // Set outputs
  const responseOutput = typeof result.response === 'string' 
    ? result.response 
    : JSON.stringify(result.response);
  
  console.log(`::set-output name=response::${responseOutput}`);
  console.log(`::set-output name=status::${result.status}`);
  console.log(`::set-output name=success::${result.success}`);
  console.log(`::set-output name=headers::${JSON.stringify(result.headers)}`);

  if (!result.success) {
    Deno.exit(1);
  }
} catch (error) {
  console.error(`💥 Fatal error: ${error.message}`);
  Deno.exit(1);
}
```

### `action.yml` (Composite Action)

```yaml
name: 'Deno API Client'
description: 'Make authenticated API requests with retry logic and error handling'
inputs:
  api-url:
    description: 'API endpoint URL'
    required: true
  method:
    description: 'HTTP method'
    required: false
    default: 'GET'
  auth-type:
    description: 'Authentication type (bearer, apikey, basic, none)'
    required: false
    default: 'none'
  auth-token:
    description: 'Authentication token/key'
    required: false
  headers:
    description: 'Additional headers (JSON format)'
    required: false
    default: '{}'
  body:
    description: 'Request body for POST/PUT requests'
    required: false
  timeout:
    description: 'Request timeout in milliseconds'
    required: false
    default: '30000'
  retry-count:
    description: 'Number of retry attempts'
    required: false
    default: '3'
outputs:
  response:
    description: 'API response body'
  status:
    description: 'HTTP status code'
  success:
    description: 'Whether request was successful'
  headers:
    description: 'Response headers (JSON format)'
runs:
  using: 'composite'
  steps:
    - name: Setup Deno
      uses: denoland/setup-deno@v1
      with:
        deno-version: v1.x
    - name: Execute API Request
      shell: bash
      run: deno run --allow-net --allow-env ${{ github.action_path }}/api-client.ts
      env:
        INPUT_API-URL: ${{ inputs.api-url }}
        INPUT_METHOD: ${{ inputs.method }}
        INPUT_AUTH-TYPE: ${{ inputs.auth-type }}
        INPUT_AUTH-TOKEN: ${{ inputs.auth-token }}
        INPUT_HEADERS: ${{ inputs.headers }}
        INPUT_BODY: ${{ inputs.body }}
        INPUT_TIMEOUT: ${{ inputs.timeout }}
        INPUT_RETRY-COUNT: ${{ inputs.retry-count }}
```

## 🔍 Local Testing

```bash
# Test GET request
export INPUT_API-URL="https://jsonplaceholder.typicode.com/posts/1"
export INPUT_METHOD="GET"
export INPUT_AUTH-TYPE="none"

deno run --allow-net --allow-env api-client.ts

# Test POST request
export INPUT_API-URL="https://jsonplaceholder.typicode.com/posts"
export INPUT_METHOD="POST"
export INPUT_HEADERS='{"Content-Type": "application/json"}'
export INPUT_BODY='{"title": "Test", "body": "Test content", "userId": 1}'

deno run --allow-net --allow-env api-client.ts
```

## 🛡️ Security Best Practices

1. **Secrets Management**: Store API keys and tokens in GitHub Secrets
2. **Least Privilege**: Only request necessary permissions
3. **Input Validation**: Validate all inputs before making requests
4. **Rate Limiting**: Respect API rate limits and implement backoff
5. **Error Logging**: Log errors without exposing sensitive information

## 🚀 Advanced Features

- **Response Caching**: Cache responses to reduce API calls
- **Pagination Support**: Handle paginated API responses
- **Webhook Validation**: Verify webhook signatures
- **Custom Retry Logic**: Implement different retry strategies
- **Response Transformation**: Process and transform API responses

## 📚 Common Use Cases

- **CI/CD Integration**: Deploy applications via APIs
- **Monitoring**: Check service health and metrics
- **Notifications**: Send alerts to Slack, Discord, etc.
- **Data Synchronization**: Sync data between services
- **External Validations**: Validate deployments with external services

## 🔗 Related Examples

- [Basic Action](../basic-action/) - Learn the fundamentals
- [Web Scraper](../web-scraper/) - For unstructured web content