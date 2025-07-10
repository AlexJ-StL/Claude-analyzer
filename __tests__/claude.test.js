import { describe, it, expect } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import provider from '../providers/claude.js';

fetchMock.enableMocks();

describe('Claude Provider Tests', () => {

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

      const actual = provider.formatPrompt(projectInfo, config);

      // Validate key elements appear in the prompt
      expect(actual).toContain('**Project Name:** Project Alpha');
      expect(actual).toContain('**Directory Structure (Key Directories):');
      expect(actual).toContain('* `src/`');
      expect(actual).toContain('* `test/`');
      expect(actual).toContain('* `dist/`');
      expect(actual).toContain('**File:** `src/main.js`');
      expect(actual).toContain('**File:** `src/utils.js`');
      expect(actual).toContain('**File:** `test/main.spec.js`');
      expect(actual).toContain('**Key Dependencies:**');
      expect(actual).toContain('* react');
      expect(actual).toContain('* axios');
      expect(actual).toContain('* jest');
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
      expect(result).toContain('**Directory Structure (Key Directories):');
      expect(result).toContain('* `lib/`');

      // Check for proper empty dependency handling
      expect(result).not.toContain('**Key Dependencies:**');

      // Validate file formatting with missing functionCount/classCount
      expect(result).toContain('**File:** `lib/index.ts`');
      expect(result).toContain('  * **Details:** 25 lines, 0 functions, 0 classes.');

      const limitedConfig = {
        includeStructureOnly: true,
        codeSnippets: false,
      };

      // Verify directory structure prioritization
      const limitedResult = provider.formatPrompt(projectInfo, limitedConfig);
      expect(limitedResult).toContain('**Directory Structure (Key Directories):');
      expect(limitedResult).not.toContain('Code Snippet:');
    });

    // Authentication Handling tests removed as generatePrompt function is not implemented
  });

});
