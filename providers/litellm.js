function formatPrompt(projectInfo, config) {
	let userPrompt = `**Project:** ${projectInfo.name}\n\n`;

	if (projectInfo.language) {
		userPrompt += `**Language:** ${projectInfo.language}\n`;
	}

	if (projectInfo.description) {
		userPrompt += `**Description:** ${projectInfo.description}\n\n`;
	} else if (projectInfo.readme) {
		userPrompt += `**README:** ${projectInfo.readme}\n\n`;
	}

	userPrompt += `**Project Structure:**\n`;
	userPrompt += `* Files: ${projectInfo.fileCount}\n`;
	userPrompt += `* Directories: ${projectInfo.directoryCount}\n`;
	userPrompt += `* Key Directories: ${projectInfo.directories.slice(0, 5).join(', ')}\n`;
	userPrompt += `* Key Files: ${projectInfo.keyFiles.join(', ')}\n\n`;

	if (projectInfo.dependencies) {
		const deps = Object.keys(projectInfo.dependencies);
		if (deps.length > 0) {
			userPrompt += `**Dependencies:**\n`;
			userPrompt += deps.slice(0, 10).join(', ');
			if (deps.length > 10) userPrompt += `, and ${deps.length - 10} more`;
			userPrompt += `\n\n`;
		}
	}

	userPrompt += `**Key File Contents:**\n\n`;

	for (const file of projectInfo.fileAnalysis.slice(0, 5)) {
		userPrompt += `**${file.path}**\n`;

		if (config.includeStructureOnly) {
			userPrompt += `* ${file.lineCount} lines, ${file.functionCount} functions, ${file.classCount} classes\n\n`;
		} else {
			userPrompt += `\`\`\`\n${file.sample}\n\`\`\`\n\n`;
			if (file.functions.length > 0) {
				userPrompt += `* Key Functions: ${file.functions.slice(0, 3).join(', ')}\n`;
			}
			if (file.classes.length > 0) {
				userPrompt += `* Key Classes: ${file.classes.slice(0, 3).join(', ')}\n`;
			}
			if (file.comments.length > 0) {
				userPrompt += `* Key Comments: ${file.comments.slice(0, 3).join(', ')}\n`;
			}
			userPrompt += '\n';
		}
	}

	const messages = [
		{
			role: 'system',
			content:
				'You are an expert programmer. Analyze the provided project context and assist the user with their request.',
		},
		{ role: 'user', content: userPrompt },
	];

	return JSON.stringify({ messages });
}

async function fetchData(options = {}) {
	// Mock implementation for testing
	if (options.apiKey === undefined && !process.env.LITELLM_API_KEY) {
		throw new Error('Missing API Key');
	}

	// Simulate API call
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: 'mock data', hasMore: options.page ? true : false });
		}, 10);
	});
}

export default { formatPrompt, fetchData };
