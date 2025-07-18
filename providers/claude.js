/**
 * A provider for the [Claude AI](https://claude.ai) API.
 *
 * Formats prompts and submits calls to the API and returns the output.
 */

import fetch from 'node-fetch';

export default {
	setup() {
		// Load API key or authenticate if required
		// Here we don't have authentication for simplicity, but in practice, handle authentication.
	},

	formatPrompt(projectInfo, config = {}) {
		let prompt =
			`You are generating a code analysis for the project "${projectInfo.name}". ` +
			`Here's the structure and contents of the project:\n` +
			`\n` +
			`Project structure:\n${config.includeStructure ? (projectInfo.directories || []).join('\n') : ''}\n` +
			`Number of ${projectInfo.fileCount || 0} files across ${projectInfo.directoryCount || 0} directories\n` +
			`\n` +
			`Code overview:\n`;

		if (projectInfo.fileAnalysis) {
			for (const analysis of projectInfo.fileAnalysis) {
				const funcCount = analysis.functions?.length || 0;
				const classCount = analysis.classes?.length || 0;
				prompt += `${analysis.path} (${analysis.lineCount} lines):\n`;
				prompt += `  - ${funcCount} function`;
				if (funcCount > 1) prompt += 's';
				prompt += `\n`;
				prompt += `  - ${classCount} class`;
				if (classCount > 1) prompt += 'es';
				prompt += `\n`;
			}
		}

		if (config.includeDependencies && projectInfo.dependencies) {
			prompt += `\nDependencies required:\n`;
			for (const [depName, version] of Object.entries(projectInfo.dependencies)) {
				prompt += `- ${depName}@${version}\n`;
			}
		}

		// Handle simple files array from test
		if (projectInfo.files && Array.isArray(projectInfo.files)) {
			prompt += `\nFiles:\n`;
			for (const file of projectInfo.files) {
				prompt += `- ${file}\n`;
			}
		}

		// Handle simple dependencies array from test
		if (projectInfo.dependencies && Array.isArray(projectInfo.dependencies)) {
			prompt += `\nDependencies:\n`;
			for (const dep of projectInfo.dependencies) {
				prompt += `- ${dep}\n`;
			}
		}

		prompt +=
			'\nInstructions: \n' +
			'- Analyze the project structure and code files\n' +
			'- Highlight key patterns, components, and dependencies\n' +
			'- Provide a concise overview of how the code is organized and works\n';

		return prompt.trim();
	},

	async generate(projectInfo, config) {
		try {
			const prompt = this.formatPrompt(projectInfo, config);

			const requestBody = {
				prompt,
				max_tokens: 200,
				temperature: 0.7,
				return_only_completion: true,
			};

			const response = await fetch('https://api.anthropic.com/v1/complete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': process.env.CLAUDE_API_KEY || 'your_api_key_here', // Placeholder for real API key
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				console.error(`Failed to generate code analysis with status code ${response.status}`);
				return null;
			}

			const data = await response.json();
			// Assuming the API returns the generated code in "completions"
			return data.completions[0];
		} catch (error) {
			console.error('Error generating code analysis: ', error);
			return null;
		}
	},

	async sendRequest(inputData) {
		try {
			const requestBody = {
				prompt: inputData.text || 'Default prompt',
				max_tokens: 200,
				temperature: 0.7,
				return_only_completion: true,
			};

			const response = await fetch('https://api.anthropic.com/v1/complete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': process.env.CLAUDE_API_KEY || 'your_api_key_here',
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				console.error(`Failed to send request with status code ${response.status}`);
				return null;
			}

			const data = await response.json();
			return data.completions[0];
		} catch (error) {
			console.error('Error sending request: ', error);
			return null;
		}
	},

	// Optional method for setting custom options
	setOptions(_apiKey) {},

	// Optional method for setting project-specific context
	setContext(_projectRoot, _packageName) {},
};
