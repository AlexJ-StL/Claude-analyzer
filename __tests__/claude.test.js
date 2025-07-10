import { describe, it, expect, vi } from '@jest/globals';

// Import the provider module (assumed to be a default export)
import provider from '../providers/claude.js';

describe('Claude Provider Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Prompt Generation', () => {
    it('should generate the correct prompt format for a project', async () => {
      const projectInfo = {
        name: 'Project Alpha',
        description: 'A sample project to demonstrate formatting',
        language: 'JavaScript',
        fileCount: 12,
        directoryCount: 4,
        directories: ['src', 'test', 'dist'],
        fileAnalysis: [
          { path: 'src/main.js', lineCount: 52, functionCount: 5, classCount: 1 },
          { path: 'src/utils.js', lineCount: 38, functionCount: 8, classCount: 0 },
          { path: 'test/main.spec.js', lineCount: 27, functionCount: 4, classCount: 0 },
        ],
        dependencies: {
          'react': '^18.2.0',
          'axios': '^0.27.2',
          'jest': '^29.3.1',
        },
      };

      const config = {
        includeStructureOnly: true,
      };

      const expectedPrompt = `Analyze the following software project and provide a summary. Focus on the project's primary goal, the technologies used, and how the different files and directories contribute to the overall architecture.

**Project Name:** Project Alpha

**Description:** A sample project to demonstrate formatting

**Detected Language:** JavaScript

**Project Size:** 12 files, 4 directories

**Directory Structure (Key Directories):**
* \`src/\`
* \`test/\`
* \`dist/\`

**Key File Analysis:**

* **File:** \`src/main.js\`
  * **Details:** 52 lines, 5 functions, 1 classes.

* **File:** \`src/utils.js\`
  * **Details:** 38 lines, 8 functions, 0 classes.

* **File:** \`test/main.spec.js\`
  * **Details:** 27 lines, 4 functions, 0 classes.

**Key Dependencies:**
* react
* axios
* jest

**Your Task:**
Based on the information provided, please generate a concise technical summary of the project. The summary should be easy for a developer to quickly understand the project\'s purpose and structure. Include information about its architecture, complexity, and any noteworthy features. Also, provide recommendations for adding new modules or features, testing structure improvements, and optimizations to ensure maintainability and scalability. Remember to tailor your suggestions to this language and project scope.

`;

      const actual = provider.formatPrompt(projectInfo, config);

      // Regex pattern to validate the Markdown formatting structure
      const pattern = /^Analyze the following software project and provide a summary\. Focus on the project's primary goal, the technologies used, and how the different files and directories contribute to the overall architecture\./;
      expect(pattern.test(actual)).toBe(true);

      // Validate key information points
      expect(actual).toContain('**Project Name:** Project Alpha');
      expect(actual).toContain(
        '**Directory Structure (Key Directories):**\n* `src/`\n* `test/`\n* `dist/`'
      );

      expect(actual).toContain(
        '**File:** `src/main.js`\n  * **Details:** 52 lines, 5 functions, 1 classes.'
      );
      expect(actual).toContain(
        '**File:** `src/utils.js`\n  * **Details:** 38 lines, 8 functions, 0 classes.'
      );
      expect(actual).toContain(
        '**File:** `test/main.spec.js`\n  * **Details:** 27 lines, 4 functions, 0 classes.'
      );

      expect(actual).toContain('**Key Dependencies:**\n* react\n* axios\n* jest');

    });

    it('should handle partial data and edge cases gracefully', async () => {
      const projectInfo = {
        name: 'Small Project',
        fileCount: 2,
        directoryCount: 1,
        directories: ['lib'],
        fileAnalysis: [
          { path: 'lib/index.ts', lineCount: 25 },
          { path: 'tsconfig.json', lineCount: 5 },
        ],
        dependencies: {},
      };

      const config = {
        includeStructureOnly: false,
        codeSnippets: false,
      };

      // Verify key elements appear with minimal data input
      const result = provider.formatPrompt(projectInfo, config);
      expect(result).toContain('**Project Name:** Small Project');
      expect(result).toContain('**Directory Structure (Key Directories):**\n* `lib/`');

      // Check for proper empty dependency handling
      expect(result).not.toContain('**Key Dependencies:**');

      // Validate file formatting with missing functionCount/classCount
      expect(result).toContain('  * **Details:** 25 lines, 0 functions, 0 classes.');


      const limitedConfig = {
        includeStructureOnly: true,
        codeSnippets: false,
      };

      // Verify directory structure prioritization
      const limitedResult = provider.formatPrompt(projectInfo, limitedConfig);
      expect(limitedResult).toContain('Directory Structure (Key Directories):');
      expect(limitedResult).not.toContain('Code Snippet:');

    });

    describe('Authentication Handling', () => {
      beforeEach(() => {
        // Enable fetch mocking
        const fetchMock = require('jest-fetch-mock');
        fetchMock.enableMocks();
      });

      afterEach(() => {
        // Reset fetch mocks
        vi.restoreAllMocks();
      });

      it('should manage API keys for authenticated requests', async () => {
        const authData = {
          apiKey: '123e4567-e89b-12d3-a456-426614174000',
        };
    
        fetchMock.mockResponseOnce(JSON.stringify({
          output: `API Key validation successful, can proceed to generate prompts`
        }), {status: 200});
    
        await provider.generatePrompt(authData);
    
        expect(fetchMock.mock.calls.length).toBe(1);
        expect(fetchMock.mock.calls[0][1].headers['Authorization']).toBe(`Bearer ${authData.apiKey}`);
      });

      it('should return error for missing API key', async () => {
        const invalidAuth = {
          apiKey: '',  // Empty API key
        };
    
        fetchMock.mockResponseOnce(JSON.stringify({
          error: 'Invalid or missing API key'
        }), {
          status: 403   
        });
    
        await provider.generatePrompt(invalidAuth);
    
        expect(fetch.mock.calls.length).toBe(1);
        expect(fetch.mock.calls[0][1].headers['Authorization']).toContain(`${invalidAuth.apiKey}`);
        expect(generatePrompt).rejects.toThrowError('Invalid or missing API key');
      });

    });

  });
});
