# Basic Deno Action

A simple "Hello World" GitHub Action built with Deno that demonstrates the fundamentals of creating custom actions.

## 📋 What This Action Does

- Accepts a `name` input parameter
- Logs a personalized greeting message
- Sets an output with the greeting text
- Demonstrates basic Deno action structure

## 🔧 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | No | `World` | The name to greet |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `greeting` | The generated greeting message |

## 📝 Usage

Create a workflow file (e.g., `.github/workflows/basic.yml`):

```yaml
name: Basic Deno Action Demo
on: [push]

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: Run Basic Action
        id: greet
        run: deno run --allow-env main.ts
        env:
          INPUT_NAME: ${{ github.actor }}
      
      - name: Use Output
        run: echo "Greeting: ${{ steps.greet.outputs.greeting }}"
```

## 🚀 Action Code

### `main.ts`

```typescript
// Get input from environment variables
const name = Deno.env.get("INPUT_NAME") || "World";

// Generate greeting
const greeting = `Hello, ${name}! 👋`;

// Log the greeting
console.log(greeting);

// Set output for use in other steps
console.log(`::set-output name=greeting::${greeting}`);
```

### `action.yml` (if using as a composite action)

```yaml
name: 'Basic Deno Greeting'
description: 'A simple greeting action built with Deno'
inputs:
  name:
    description: 'Name to greet'
    required: false
    default: 'World'
outputs:
  greeting:
    description: 'The greeting message'
runs:
  using: 'composite'
  steps:
    - name: Setup Deno
      uses: denoland/setup-deno@v1
      with:
        deno-version: v1.x
    - name: Run Action
      shell: bash
      run: deno run --allow-env ${{ github.action_path }}/main.ts
      env:
        INPUT_NAME: ${{ inputs.name }}
```

## 🎯 Key Learning Points

1. **Environment Variables**: Deno actions receive inputs via environment variables prefixed with `INPUT_`
2. **Outputs**: Use GitHub's workflow commands to set outputs that other steps can use
3. **Permissions**: Specify only the Deno permissions your action needs (here: `--allow-env`)
4. **Setup**: Use the official `denoland/setup-deno` action for consistent Deno environments

## 🔍 Local Testing

Test your action locally:

```bash
# Set input environment variable
export INPUT_NAME="Developer"

# Run the action
deno run --allow-env main.ts
```

## 📚 Next Steps

- Explore the [web-scraper](../web-scraper/) example for HTTP requests
- Check out the [api-client](../api-client/) example for external API integration
- Learn about [Deno permissions](https://deno.land/manual/getting_started/permissions) for secure actions