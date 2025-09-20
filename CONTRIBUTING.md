# Contributing to Deno Demo Actions

Thank you for your interest in contributing to this repository! 🎉 We welcome contributions that help others learn and implement Deno-based GitHub Actions.

## 🤝 How to Contribute

### 1. Types of Contributions

We welcome several types of contributions:

- **New Action Examples**: Add new demo actions showcasing different use cases
- **Documentation Improvements**: Enhance existing READMEs or add missing documentation
- **Bug Fixes**: Fix issues in existing action code
- **Code Quality**: Improve code structure, add error handling, or optimize performance
- **Testing**: Add test cases for action examples

### 2. Before You Start

- Check the [existing issues](https://github.com/jackyrwj/deno-demo-actions/issues) to see if your idea is already being discussed
- Look at the [existing examples](./examples/) to understand the project structure and coding style
- Make sure your contribution fits the educational purpose of this repository

## 📋 Contribution Guidelines

### Adding a New Action Example

When adding a new action example, please:

1. **Create a new directory** under `examples/` with a descriptive name (e.g., `examples/database-backup/`)

2. **Include these files**:
   - `README.md` - Comprehensive documentation (see template below)
   - `main.ts` or similar - The main action code
   - `action.yml` - Action metadata file (optional but recommended)
   - Example workflow files if applicable

3. **Follow the README template**:
   ```markdown
   # Action Name
   
   Brief description of what the action does.
   
   ## 📋 What This Action Does
   ## 🔧 Inputs
   ## 📤 Outputs
   ## 📝 Usage Examples
   ## 🚀 Action Code
   ## 🔍 Local Testing
   ## ⚠️ Best Practices (if applicable)
   ## 🛡️ Security Considerations (if applicable)
   ## 📚 Advanced Features (if applicable)
   ## 🔗 Related Examples
   ```

4. **Code Quality Standards**:
   - Use TypeScript with proper type annotations
   - Include comprehensive error handling
   - Add helpful console logging with emojis for visual clarity
   - Follow Deno best practices and use built-in APIs when possible
   - Implement proper input validation
   - Use meaningful variable and function names

5. **Documentation Standards**:
   - Provide clear, actionable examples
   - Include both basic and advanced usage scenarios
   - Document all inputs and outputs in tables
   - Add security considerations for sensitive operations
   - Include local testing instructions

### Improving Existing Examples

When improving existing examples:

- Maintain backward compatibility unless there's a compelling reason not to
- Update documentation to reflect any changes
- Test your changes thoroughly
- Explain the reasoning behind your improvements in the pull request

## 🚀 Development Setup

### Prerequisites

- [Deno](https://deno.land/) latest stable version
- [Git](https://git-scm.com/)
- A GitHub account

### Local Development

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/deno-demo-actions.git
   cd deno-demo-actions
   ```

2. **Create a new branch**:
   ```bash
   git checkout -b feature/your-action-name
   ```

3. **Develop your action**:
   - Create your action directory and files
   - Test locally using the provided testing instructions
   - Ensure all code works as documented

4. **Test your action**:
   ```bash
   # Navigate to your action directory
   cd examples/your-action-name
   
   # Set required environment variables
   export INPUT_EXAMPLE="test-value"
   
   # Run your action
   deno run --allow-net --allow-env main.ts
   ```

## 📝 Pull Request Process

1. **Create a descriptive pull request**:
   - Use a clear title that describes what you're adding/fixing
   - Include a detailed description of your changes
   - Reference any related issues

2. **Pull request template**:
   ```markdown
   ## What does this PR do?
   Brief description of the changes
   
   ## Type of change
   - [ ] New action example
   - [ ] Documentation improvement
   - [ ] Bug fix
   - [ ] Code quality improvement
   - [ ] Other (please describe)
   
   ## Testing
   - [ ] I have tested this action locally
   - [ ] I have verified all documentation is accurate
   - [ ] I have followed the coding standards
   
   ## Additional context
   Any additional information or context
   ```

3. **Review process**:
   - Maintainers will review your PR within a few days
   - Address any feedback or requested changes
   - Once approved, your PR will be merged

## 🎯 Action Ideas We'd Love to See

Here are some ideas for new action examples that would be valuable:

### Infrastructure & DevOps
- **Docker Image Scanner**: Scan Docker images for vulnerabilities
- **Terraform Validator**: Validate Terraform configurations
- **Environment Provisioner**: Provision cloud resources
- **SSL Certificate Checker**: Monitor SSL certificate expiration

### Data & Analytics
- **Database Backup**: Automated database backup to cloud storage
- **Log Analyzer**: Parse and analyze application logs
- **Metrics Collector**: Collect and send metrics to monitoring systems
- **Data Validator**: Validate data files and formats

### Communication & Notifications
- **Multi-Platform Notifier**: Send notifications to multiple platforms
- **Status Page Updater**: Update status pages during incidents
- **Team Mention**: Smart team member mentions based on code changes
- **Release Announcer**: Automatically announce releases

### Security & Compliance
- **Dependency Auditor**: Advanced dependency vulnerability scanning
- **Code Quality Gate**: Enforce code quality standards
- **Secret Scanner**: Scan for accidentally committed secrets
- **Compliance Checker**: Check code against compliance standards

### Utilities
- **File Transformer**: Transform files between different formats
- **Image Optimizer**: Optimize images for web usage
- **Documentation Generator**: Generate docs from code comments
- **Changelog Generator**: Automatically generate changelogs

## 📊 Code Style Guide

### Deno-Specific Guidelines

```typescript
// ✅ Good: Use Deno's built-in APIs
const text = await Deno.readTextFile("file.txt");

// ❌ Avoid: Node.js-style imports when Deno alternatives exist
import * as fs from "fs";

// ✅ Good: Use Deno's URL imports for external dependencies
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

// ✅ Good: Proper error handling
try {
  const result = await riskyOperation();
  console.log("✅ Operation successful");
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  Deno.exit(1);
}

// ✅ Good: Input validation
const url = Deno.env.get("INPUT_URL");
if (!url) {
  throw new Error("URL input is required");
}

// ✅ Good: Type definitions
interface ActionConfig {
  url: string;
  timeout: number;
  retryCount: number;
}
```

### Documentation Style

- Use emojis consistently for visual appeal (but don't overuse them)
- Provide both simple and complex examples
- Include security considerations for any sensitive operations
- Use code blocks with proper syntax highlighting
- Structure documentation consistently across all examples

## 🆘 Getting Help

If you need help or have questions:

1. **Check existing documentation** in the `examples/` directory
2. **Search existing issues** on GitHub
3. **Create a new issue** with the `question` label
4. **Join discussions** in existing issues or pull requests

## 📄 License

By contributing to this repository, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

## 🙏 Recognition

Contributors will be recognized in the following ways:

- Listed in the repository contributors
- Mentioned in release notes for significant contributions
- Referenced in the action documentation you create

Thank you for helping make Deno GitHub Actions more accessible to everyone! 🚀