/**
 * Formats the project analysis data into a generic prompt for OpenRouter
 * @param {Object} projectInfo - The analysis data
 * @param {Object} config - The configuration options
 * @returns {string} - The formatted prompt
 */
function formatPrompt(projectInfo, config) {
	let prompt = `You are an expert code analysis assistant. Below is a summary of a software project. Your task is to provide a high-level overview of the project.\n\n`;

	prompt += `## Project: ${projectInfo.name}\n`;
	if (projectInfo.description) {
		prompt += `> ${projectInfo.description}\n`;
	}
	prompt += `* Language: ${projectInfo.language || 'Not detected'}\n`;
	prompt += `* Size: ${projectInfo.fileCount} files in ${projectInfo.directoryCount} directories\n`;

	prompt += `\n### Key Directories\n`;
	prompt += '```\n';
	projectInfo.directories.slice(0, 10).forEach(dir => {
		prompt += `${dir}/\n`;
	});
	prompt += '```\n';

	prompt += `\n### Key Files\n`;
	projectInfo.fileAnalysis.forEach(file => {
		prompt += `\n**${file.path}**\n`;
		prompt += `*Stats: ${file.lineCount} lines, ${file.functionCount} functions, ${file.classCount} classes.*\n`;
		if (!config.includeStructureOnly && file.sample) {
			const fileType = file.path.split('.').pop();
			prompt += `\n\`\`\`${fileType}
${file.sample}
\`\`\`\n`;
		}
	});

	if (projectInfo.dependencies && Object.keys(projectInfo.dependencies).length > 0) {
		prompt += `\n### Key Dependencies\n`;
		prompt += '```\n';
		Object.keys(projectInfo.dependencies)
			.slice(0, 10)
			.forEach(dep => {
				prompt += `- ${dep}\n`;
			});
		prompt += '```\n';
	}

	prompt +=
		'\n### Your Analysis\nBased on the data, provide a summary of the project including its purpose, architecture, and main functionalities.';

	return prompt;
}

/**
 * Fetches data from OpenRouter API
 * @param {string} url - The endpoint URL
 * @returns {Promise<Object>} - The response data
 */
async function fetchData(url, options) {
	if (!url) throw new Error('Missing API endpoint URL');

	try {
		const response = await fetch(url, {
			method: 'GET',
			...options,
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		// Handle fetch errors
		return Promise.reject(new Error(`Data fetch to OpenRouter failed: ${error.message}`));
	}
}

/**
 * Processes API response and normalizes it
 * @param {Object} response - The raw API response
 * @returns {Promise<Object>} - The processed response
 */
async function processResponse(response) {
	// Mock implementation for testing
	return new Promise(resolve => {
		setTimeout(() => {
			if (response.error) {
				resolve({
					statusCode: 404,
					apiResponse: response,
				});
			} else {
				resolve({
					statusCode: 200,
					apiResponse: response,
				});
			}
		}, 10);
	});
}

export default {
	formatPrompt,
	fetchData,
	processResponse,
};
