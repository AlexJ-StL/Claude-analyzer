/**
 * Formats the project analysis data into a prompt for Gemini
 * @param {Object} projectInfo - The analysis data
 * @param {Object} config - The configuration options
 * @returns {string} - The formatted prompt
 */
function formatPrompt(projectInfo, config) {
  let prompt = `Analyze the following software project and provide a summary. Focus on the project's primary goal, the technologies used, and how the different files and directories contribute to the overall architecture.\n\n`;

  prompt += `**Project Name:** ${projectInfo.name}\n`;
  if (projectInfo.description) {
    prompt += `**Description:** ${projectInfo.description}\n`;
  }
  if (projectInfo.language) {
    prompt += `**Detected Language:** ${projectInfo.language}\n`;
  }
  prompt += `**Project Size:** ${projectInfo.fileCount} files, ${projectInfo.directoryCount} directories\n`;

  prompt += `\n**Directory Structure (Key Directories):**\n`;
  projectInfo.directories.slice(0, 10).forEach(dir => {
    prompt += `* \`${dir}/\`\n`;
  });

  prompt += `\n**Key File Analysis:**\n`;
  projectInfo.fileAnalysis.forEach(file => {
    prompt += `\n*   **File:** \`${file.path}\`\n`;
    prompt += `    *   **Details:** ${file.lineCount} lines, ${file.functionCount} functions, ${file.classCount} classes.\n`;
    if (!config.includeStructureOnly && file.sample) {
      prompt += `    *   **Code Snippet:**\n        \`\`\`\n${file.sample}\n\`\`\`\n`;
    }
  });

  if (projectInfo.dependencies && Object.keys(projectInfo.dependencies).length > 0) {
    prompt += `\n**Key Dependencies:**\n`;
    Object.keys(projectInfo.dependencies).slice(0, 10).forEach(dep => {
      prompt += `* ${dep}\n`;
    });
  }

  prompt += '\n**Your Task:**\nBased on the information provided, please generate a concise technical summary of the project. The summary should be easy for a developer to quickly understand the project\'s purpose and structure.';

  return prompt;
}

export default {
  formatPrompt
};
