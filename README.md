# Claude Project Analyzer

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
git clone https://github.com/yourusername/claude-analyzer
cd claude-analyzer

# Install dependencies
npm install

# Install globally
npm install -g .
```

## Usage

### Command Line

```bash
# Basic usage
claude-analyzer /path/to/your/project

# Save output to file
claude-analyzer /path/to/your/project --output prompt.md

# Structure-only mode (no code samples)
claude-analyzer /path/to/your/project --structure-only

# Customize analysis depth
claude-analyzer /path/to/your/project --max-files 10 --max-lines 30
```

### Options

- `-h, --help`: Show help information
- `-v, --version`: Display version information
- `-o, --output FILE`: Write output to FILE instead of stdout
- `-s, --structure-only`: Only include structure info, no code samples
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

## Sample Output

```
## Project: my-web-app

Primary language: JavaScript/TypeScript
Description: A React-based web application for document management

### Project Structure:
- 128 files in 23 directories
- Key directories: src, public, components, utils, api
- Key files: src/index.js, src/App.js, package.json, src/components/Header.jsx, src/api/client.js

### Main Dependencies:
react, react-dom, axios, tailwindcss, zustand, and 12 more

### Key File Contents:

#### src/index.js
```
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

... [other key files] ...

### Instructions for Claude:
Based on this project structure and code samples, I'm working on this JavaScript/TypeScript project. Please help me with coding tasks, explanation, debugging, and feature suggestions based on this context. You should reference the provided code structure when responding to my questions about this project.
```

## Benefits

- **Token Efficiency**: Reduces token usage while maintaining productive context
- **Project Understanding**: Helps Claude understand your project structure quickly
- **Code Awareness**: Provides just enough code samples for meaningful assistance
- **Time Saving**: Automates the process of creating effective prompts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT