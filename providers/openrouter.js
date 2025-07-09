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
    Object.keys(projectInfo.dependencies).slice(0, 10).forEach(dep => {
      prompt += `- ${dep}\n`;
    });
    prompt += '```\n';
  }

  prompt += '\n### Your Analysis\nBased on the data, provide a summary of the project including its purpose, architecture, and main functionalities.';

  return prompt;
}

export default {
  formatPrompt
};
