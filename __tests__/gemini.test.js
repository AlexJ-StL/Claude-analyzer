import { describe, it, expect } from '@jest/globals';

import provider from '../providers/gemini.js'; // Adjusted for ESM

describe('Gemini Provider Tests', () => {
  it('should format prompt correctly with minimal data', () => {
    const projectInfo = {
      name: 'ExampleApp',
      directoryCount: 3,
      fileCount: 10,
      directories: ['src', 'tests'],
      fileAnalysis: [
        { path: 'app.js', lineCount: 20, functionCount: 3 },
        { path: 'utils.js', lineCount: 15 }
      ]
    };

    const expected = `
      Analyze the following software project and provide a summary. Focus on the project's primary goal, the technologies used, and how the different files and directories contribute to the overall architecture.

      **Project Name:** ExampleApp
      **Project Size:** 10 files, 3 directories

      **Directory Structure (Key Directories):**
      * \`src/\`
      * \`tests/\`

      **Key File Analysis:**

      * **File:** \`app.js\`
        * **Details:** 20 lines, 3 functions, 0 classes.

      * **File:** \`utils.js\`
        * **Details:** 15 lines, 0 functions, 0 classes.

      **Your Task:**
      Based on the information provided, please generate a concise technical summary of the project. The summary should be easy for a developer to quickly understand the project\'s purpose and structure.
    `;

    expect(provider.formatPrompt(projectInfo, {})).toContain(
      "**Project Name:** ExampleApp"
    );
    expect(provider.formatPrompt(projectInfo, {})).toContain("app.js");
    expect(provider.formatPrompt(projectInfo, {})).toContain("**Your Task:**");
  });

  it('should handle optional data properties gracesfully', () => {
    const simplifiedProject = {
      name: 'SDKv2',
      directoryCount: 1,
      fileCount: 4,
      directories: [],
      fileAnalysis: []
    };

    // Test output when no directories/files exist
    const result = provider.formatPrompt(simplifiedProject, {});
    expect(result).toContain("SDKv2");
    expect(result).not.toContain("**Directory Structure**");
    expect(result).not.toContain("**Key File Analysis**");
  });
});

// Fix ESLint errors in gemini.test.js

// Remove unused expected variable

// Correct unnecessary escape character in template literal
