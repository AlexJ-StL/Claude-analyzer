# Claude Project Analyzer v1.1.0

A tool for generating minimal but effective prompts for Claude.AI based on project structure and code analysis.

## Problem

Working with large codebases in Claude.AI can quickly consume tokens, making it expensive and inefficient. This tool solves this problem by:

1. Analyzing your project structure
2. Identifying key files and components
3. Extracting essential code samples
4. Generating a minimal but useful context prompt for Claude

## Installation

```bash
# Clone the repository
git clone https://github.com/AlexJ-StL/Claude-analyzer.git
cd Claude-analyzer

# Install dependencies
npm install

# Install globally
npm install -g .
```

## Usage

This tool generates a prompt that you can use with your chosen LLM provider. It does not directly interact with any LLM API.

### 1. Generate a Prompt

Run the tool with the path to your project and your chosen provider.

```bash
# Basic usage (defaults to claude provider)
claude-analyzer /path/to/your/project

# Select a provider (claude, gemini, openrouter, or litellm)
claude-analyzer /path/to/your/project -p gemini

# Save the generated prompt to a file
claude-analyzer /path/to/your/project -p claude -o claude-prompt.md
```

### 2. Use the Prompt

Copy the generated prompt and use it with your chosen provider's API or web interface.

### Provider Details & API Keys

This tool does not use your API keys. You will need to use your API key when you send the generated prompt to your chosen provider. For command-line usage with other tools, it is recommended to set your API keys as environment variables.

**Claude**

- **API Key Environment Variable:** `ANTHROPIC_API_KEY`
- **Model Selection:** When you use the prompt with the Claude API or another tool, you can specify the model (e.g., `claude-3-opus-20240229`, `claude-3-sonnet-20240229`).

**Gemini**

- **API Key Environment Variable:** `GEMINI_API_KEY`
- **Model Selection:** When you use the prompt with the Gemini API or another tool, you can specify the model (e.g., `gemini-1.5-pro-latest`).

**OpenRouter**

- **API Key Environment Variable:** `OPENROUTER_API_KEY`
- **Model Selection:** OpenRouter allows you to use models from various providers. You will need to specify the model in your API request, for example `anthropic/claude-3-opus`.

**LiteLLM**

- **API Key Environment Variable:** Depends on the underlying provider you are using with LiteLLM (e.g., `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).
- **Model Selection:** You will need to specify the model when you use LiteLLM, for example `claude-3-opus-20240229`.

### Options

- `-h, --help`: Show help information
- `-v, --version`: Display version information
- `-o, --output FILE`: Write output to FILE instead of stdout
- `-s, --structure-only`: Only include structure info, no code samples
- `-p, --provider`: Specify the LLM provider (claude, gemini, openrouter, litellm) (default: claude)
- `-f, --max-files N`: Maximum number of files to analyze (default: 15)
- `-l, --max-lines N`: Maximum lines per file to include (default: 50)

### Programmatic Usage

```javascript
const { generateMinimalPrompt } = require('./analyzer');

const projectPath = '/path/to/your/project';
const options = {
  maxFilesToAnalyze: 10,
  maxLinesPerFile: 30,
  includeStructureOnly: false
};

const prompt = generateMinimalPrompt(projectPath, options);
console.log(prompt);
```

## How It Works

1. **Project Discovery**: Traverses your project structure to identify files and directories
2. **Language Detection**: Identifies the primary programming language and frameworks
3. **Key File Selection**: Prioritizes important files like main modules, configuration files, and README
4. **Code Analysis**: Extracts key snippets and insights from the most important files
5. **Prompt Generation**: Creates a compact but contextual prompt for Claude.AI

## Changelog

### v1.1.0 (2025-07-09)
- Forked from the original repository.
- Updated repository URLs in `package.json` and `README.md`.
- Added a `.gitignore` file.
- Updated version to 1.1.0.
- Added a changelog to `README.md`.

### v1.0.0
- Initial release

## Benefits

- **Token Efficiency**: Reduces token usage while maintaining productive context
- **Project Understanding**: Helps Claude understand your project structure quickly
- **Code Awareness**: Provides just enough code samples for meaningful assistance
- **Time Saving**: Automates the process of creating effective prompts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
