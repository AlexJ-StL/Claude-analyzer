const fs = require('fs');
const path = require('path');

/**
 * Generates a minimal but effective prompt for Claude based on project structure
 * @param {string} rootPath - The root directory of the project to analyze
 * @param {Object} options - Configuration options
 * @returns {string} - A minimal prompt describing the project
 */
function generateMinimalPrompt(rootPath, options = {}) {
  const defaultOptions = {
    maxFilesToAnalyze: 15,          // Maximum number of files to include in analysis
    maxLinesPerFile: 50,            // Maximum lines to extract from each file
    ignorePatterns: [               // Patterns to ignore
      'node_modules', 
      '.git',
      'dist',
      'build'
    ],
    fileExtensions: [               // File extensions to analyze
      '.js', '.jsx', '.ts', '.tsx', 
      '.py', '.java', '.c', '.cpp', 
      '.h', '.cs', '.php', '.rb', 
      '.go', '.rs', '.html', '.css'
    ],
    priorityFiles: [                // Files to prioritize in analysis
      'package.json', 
      'README.md',
      'main.js',
      'index.js',
      'app.js'
    ],
    includeStructureOnly: false     // If true, only include structure without file contents
  };

  // Merge provided options with defaults
  const config = { ...defaultOptions, ...options };
  
  // Get project structure
  const projectInfo = analyzeProject(rootPath, config);
  
  // Generate prompt
  return formatPrompt(projectInfo, config);
}

/**
 * Analyzes a project directory and extracts key information
 * @param {string} rootPath - The root directory
 * @param {Object} config - Configuration options
 * @returns {Object} - Project information
 */
function analyzeProject(rootPath, config) {
  const projectInfo = {
    name: path.basename(rootPath),
    files: [],
    directories: [],
    keyFiles: [],
    dependencies: null,
    language: null,
    fileCount: 0,
    directoryCount: 0
  };

  // Check if directory exists
  if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) {
    throw new Error(`Invalid directory path: ${rootPath}`);
  }

  // Get basic project info first
  analyzeBasicInfo(rootPath, projectInfo);
  
  // Get key files and directories
  const { importantFiles, allFiles } = getImportantFiles(rootPath, config, projectInfo);
  
  // Extract code insights from key files
  analyzeFileContents(importantFiles, projectInfo, config, rootPath);
  
  return projectInfo;
}

/**
 * Extracts basic project information (language, type, etc.)
 * @param {string} rootPath - Project root
 * @param {Object} projectInfo - Project info object to update
 */
function analyzeBasicInfo(rootPath, projectInfo) {
  // Try to determine main language and project type
  const hasPackageJson = fs.existsSync(path.join(rootPath, 'package.json'));
  const hasPyProject = fs.existsSync(path.join(rootPath, 'pyproject.toml'));
  const hasGemfile = fs.existsSync(path.join(rootPath, 'Gemfile'));
  const hasCargoToml = fs.existsSync(path.join(rootPath, 'Cargo.toml'));
  const hasCMake = fs.existsSync(path.join(rootPath, 'CMakeLists.txt'));
  
  if (hasPackageJson) {
    projectInfo.language = 'JavaScript/TypeScript';
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
    projectInfo.dependencies = packageJson.dependencies || {};
    projectInfo.devDependencies = packageJson.devDependencies || {};
    projectInfo.name = packageJson.name || projectInfo.name;
    projectInfo.description = packageJson.description || '';
  } else if (hasPyProject) {
    projectInfo.language = 'Python';
  } else if (hasGemfile) {
    projectInfo.language = 'Ruby';
  } else if (hasCargoToml) {
    projectInfo.language = 'Rust';
  } else if (hasCMake) {
    projectInfo.language = 'C/C++';
  }
  
  // Try to find README
  if (fs.existsSync(path.join(rootPath, 'README.md'))) {
    const readme = fs.readFileSync(path.join(rootPath, 'README.md'), 'utf8');
    // Extract first paragraph or first 500 chars of README
    const firstPara = readme.split('\n\n')[0].trim();
    projectInfo.readme = firstPara.length > 500 ? firstPara.substring(0, 500) + '...' : firstPara;
  }
}

/**
 * Gets the most important files for analysis
 * @param {string} dir - Directory to analyze
 * @param {Object} config - Configuration
 * @param {Object} projectInfo - Project info to update
 * @param {string} relativePath - Current relative path
 * @returns {Object} - Object containing important files and all files
 */
function getImportantFiles(dir, config, projectInfo, relativePath = '') {
  let importantFiles = [];
  let allFiles = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.join(relativePath, item);
    
    // Skip ignored patterns
    if (config.ignorePatterns.some(pattern => 
      typeof pattern === 'string' ? item === pattern : pattern.test(item))) {
      continue;
    }
    
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      projectInfo.directoryCount++;
      if (projectInfo.directories.length < 10) {
        projectInfo.directories.push(relPath);
      }
      
      // Recurse into subdirectories
      const subResults = getImportantFiles(fullPath, config, projectInfo, relPath);
      importantFiles = [...importantFiles, ...subResults.importantFiles];
      allFiles = [...allFiles, ...subResults.allFiles];
    } else if (stats.isFile()) {
      projectInfo.fileCount++;
      
      const fileExt = path.extname(item);
      if (config.fileExtensions.includes(fileExt)) {
        const fileInfo = {
          path: relPath,
          size: stats.size,
          ext: fileExt,
          isKey: config.priorityFiles.includes(item)
        };
        
        allFiles.push(fileInfo);
        
        // Add to important files if it's a priority file or we haven't reached max
        if (fileInfo.isKey || config.priorityFiles.includes(relPath)) {
          importantFiles.push(fileInfo);
          if (projectInfo.keyFiles.length < 5) {
            projectInfo.keyFiles.push(relPath);
          }
        }
      }
    }
  }
  
  // If we haven't found enough important files, add some from all files
  if (importantFiles.length < config.maxFilesToAnalyze) {
    // Sort by size (smaller first to get utility files)
    allFiles.sort((a, b) => a.size - b.size);
    
    // Add more files up to the maximum
    for (const file of allFiles) {
      if (!importantFiles.some(f => f.path === file.path) && 
          importantFiles.length < config.maxFilesToAnalyze) {
        importantFiles.push(file);
      }
    }
  }
  
  return { importantFiles, allFiles };
}

/**
 * Analyzes file contents to extract insights
 * @param {Array} files - Files to analyze
 * @param {Object} projectInfo - Project info to update
 * @param {Object} config - Configuration
 * @param {string} rootPath - The root directory of the project
 */
function analyzeFileContents(files, projectInfo, config, rootPath) {
  projectInfo.fileAnalysis = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(rootPath, file.path), 'utf8');
      const lines = content.split('\n');
      
      // Extract a sample of the file
      const sampleLines = lines.length > config.maxLinesPerFile 
        ? lines.slice(0, config.maxLinesPerFile) 
        : lines;
      
      // Basic code analysis - count functions, classes, imports
      const analysis = {
        path: file.path,
        lineCount: lines.length,
        functionCount: 0,
        classCount: 0,
        importCount: 0,
        sample: config.includeStructureOnly ? null : sampleLines.join('\n')
      };
      
      // Simple pattern matching to count code structures
      for (const line of lines) {
        if (line.match(/function\s+\w+\s*\(/)) analysis.functionCount++;
        if (line.match(/class\s+\w+/)) analysis.classCount++;
        if (line.match(/import\s+|require\(/)) analysis.importCount++;
      }
      
      projectInfo.fileAnalysis.push(analysis);
    } catch (err) {
      // Skip files we can't read
      console.error(`Error reading file ${file.path}: ${err.message}`);
    }
  }
}

/**
 * Formats the collected information into a minimal prompt
 * @param {Object} projectInfo - Project information
 * @param {Object} config - Configuration
 * @returns {string} - Formatted prompt
 */
function formatPrompt(projectInfo, config) {
  let prompt = `## Project: ${projectInfo.name}\n\n`;
  
  if (projectInfo.language) {
    prompt += `Primary language: ${projectInfo.language}\n`;
  }
  
  if (projectInfo.description) {
    prompt += `Description: ${projectInfo.description}\n\n`;
  } else if (projectInfo.readme) {
    prompt += `From README: ${projectInfo.readme}\n\n`;
  }
  
  // Add structure summary
  prompt += `### Project Structure:\n`;
  prompt += `- ${projectInfo.fileCount} files in ${projectInfo.directoryCount} directories\n`;
  prompt += `- Key directories: ${projectInfo.directories.slice(0, 5).join(', ')}\n`;
  prompt += `- Key files: ${projectInfo.keyFiles.join(', ')}\n\n`;
  
  // Add dependencies if available
  if (projectInfo.dependencies) {
    const deps = Object.keys(projectInfo.dependencies);
    if (deps.length > 0) {
      prompt += `### Main Dependencies:\n`;
      prompt += deps.slice(0, 10).join(', ');
      if (deps.length > 10) prompt += `, and ${deps.length - 10} more`;
      prompt += `\n\n`;
    }
  }
  
  // Add code snippets for key files
  prompt += `### Key File Contents:\n\n`;
  
  for (const file of projectInfo.fileAnalysis.slice(0, 5)) {
    prompt += `#### ${file.path}\n`;
    
    if (config.includeStructureOnly) {
      prompt += `- ${file.lineCount} lines, ${file.functionCount} functions, ${file.classCount} classes\n\n`;
    } else {
      prompt += `\`\`\`\n${file.sample}\n\`\`\`\n\n`;
    }
  }
  
  // Instructions for Claude
  prompt += `### Instructions for Claude:\n`;
  prompt += `Based on this project structure and code samples, I'm working on this ${projectInfo.language || ''} project. `;
  prompt += `Please help me with coding tasks, explanation, debugging, and feature suggestions based on this context. `;
  prompt += `You should reference the provided code structure when responding to my questions about this project.`;
  
  return prompt;
}

module.exports = {
  generateMinimalPrompt
};

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node analyzer.js <project-path> [options]');
    process.exit(1);
  }
  
  const projectPath = args[0];
  
  try {
    const options = {};
    if (args.includes('--structure-only')) {
      options.includeStructureOnly = true;
    }
    
    const prompt = generateMinimalPrompt(projectPath, options);
    console.log(prompt);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}