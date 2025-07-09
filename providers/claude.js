/**
 * Formats the project analysis data into a prompt for Claude
 * @param {Object} projectInfo - The analysis data
 * @param {Object} config - The configuration options
 * @returns {string} - The formatted prompt
 */
function formatPrompt(projectInfo, config) {
  let prompt = `The user wants to understand a project with the following structure and key files. Please provide a concise, high-level summary of the project's purpose, architecture, and key components based on the information below.\n\n`;

  // Start with project purpose
  if (projectInfo.description && projectInfo.description !== 'Unknown') {
    prompt += `Project Purpose: ${projectInfo.description}\n\n`;
  } else {
    prompt += `Project Purpose: Not specified\n\n`;
  }

    prompt += `Project Name: ${projectInfo.name}\n`;

  if (projectInfo.dependencies && Object.keys(projectInfo.dependencies).length > 0) {
    prompt += `\nKey Dependencies:\n`;
    const depKeys = Object.keys(projectInfo.dependencies).slice(0, 10);
    depKeys.forEach(dep => {
      prompt += `- ${dep}\n`;
    });
  }

  prompt += `Description: ${projectInfo.description || 'Unknown'}\n`;
  if (projectInfo.language) {
    prompt += `Main Language: ${projectInfo.language}\n`;
  }
  if (projectInfo.description) {
    prompt += `Description: ${projectInfo.description}\n`;
  }
  if (projectInfo.language) {
    prompt += `Main Language: ${projectInfo.language}\n`;
  }
  prompt += `Total Files: ${projectInfo.fileCount}\n`;
    prompt += `Total Directories: ${projectInfo.directoryCount}\n\n`;

  // Enhanced directory structure with role annotations
  prompt += 'Key Directories with Role Analysis:\n';
  const directoryRoles = projectInfo.directoryRoles || {};
  projectInfo.directories.slice(0, 10).forEach(dirPath => {
    const role = directoryRoles[dirPath] || 'Supporting Infrastructure';
    prompt += `- ${dirPath} [${role}]\n`;
  });
  prompt += '\n';

  prompt += 'Key Files Analysis:\n';
  projectInfo.fileAnalysis.forEach(file => {
    prompt += `\n--- File: ${file.path} ---\n`;
    prompt += `Lines: ${file.lineCount}, Functions: ${file.functionCount}, Classes: ${file.classCount}\n`;
    if (!config.includeStructureOnly && file.sample) {
      prompt += `Content Snippet:\n\`\`\`\n${file.sample}\n\`\`\`\n`;
    }
  });

  prompt += '\nPlease provide a summary based on this information.';

  return prompt;
}

export default {
  formatPrompt
};
