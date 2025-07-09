

import fs from 'fs';
import path from 'path';

/**
 * Generates a minimal but effective prompt for an LLM based on project structure
 * @param {string} rootPath - The root directory of the project to analyze
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - A minimal prompt describing the project
 */
async function generateMinimalPrompt(rootPath, options = {}) {
  const defaultOptions = {
    maxFilesToAnalyze: 15,
    maxLinesPerFile: 50,
    ignorePatterns: [
      'node_modules',
      '.git',
      'dist',
      'build'
    ],
    fileExtensions: [
      '.js', '.jsx', '.ts', '.tsx',
      '.py', '.java', '.c', '.cpp',
      '.h', '.cs', '.php', '.rb',
      '.go', '.rs', '.html', '.css'
    ],
    priorityFiles: [
      'package.json',
      'README.md',
      'main.js',
      'index.js',
      'app.js'
    ],
    includeStructureOnly: false,
    provider: 'claude' // Default provider
  };

  // Merge provided options with defaults
  const config = { ...defaultOptions, ...options };

  // Get project structure
  const projectInfo = analyzeProject(rootPath, config);

  // Dynamically load the specified provider
  const providerName = config.provider || 'claude';
  const providerPath = `./providers/${providerName}.js`;

  let provider;
  try {
    // Use dynamic import for ES modules
    const providerModule = await import(providerPath);
    provider = providerModule.default;
  } catch {
    console.error(`Failed to load provider: ${providerName}`);
    throw new Error(`Provider not found or failed to load: ${providerName}.js`);
  }


  // Generate prompt
  return provider.formatPrompt(projectInfo, config);
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

  // Get all files in the project
  const allFiles = getImportantFiles(rootPath, config);

  if (allFiles.length === 0) {
    return projectInfo;
  }

  // Sort files by score
  allFiles.sort((a, b) => b.score - a.score);

  // Get the most important files
  const importantFiles = allFiles.slice(0, config.maxFilesToAnalyze);

  // Update project info
  projectInfo.fileCount = allFiles.length;
  projectInfo.directoryCount = allFiles.filter(f => f.ext === '').length;
  projectInfo.keyFiles = importantFiles.slice(0, 5).map(f => f.path);
  projectInfo.directories = [...new Set(allFiles.map(f => path.dirname(f.path)))].slice(0, 10);

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
 * @param {string} relativePath - Current relative path
 * @returns {Array} - A list of file information objects
 */
function getImportantFiles(dir, config, relativePath = '') {
  let allFiles = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.join(relativePath, item);

    if (config.ignorePatterns.some(pattern =>
      typeof pattern === 'string' ? item === pattern : pattern.test(item))) {
      continue;
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const subFiles = getImportantFiles(fullPath, config, relPath);
      allFiles = allFiles.concat(subFiles);
    } else if (stats.isFile()) {
      const fileExt = path.extname(item);
      if (config.fileExtensions.includes(fileExt)) {
        const fileInfo = {
          path: relPath,
          size: stats.size,
          ext: fileExt,
          score: 0
        };

        // Score files based on various criteria
        if (config.priorityFiles.includes(item)) fileInfo.score += 100;
        if (item.match(/^(main|index|app)\./)) fileInfo.score += 50;
        if (item.match(/service/i)) fileInfo.score += 30;
        if (item.match(/controller/i)) fileInfo.score += 30;
        if (item.match(/route/i)) fileInfo.score += 20;
        if (item.match(/util/i)) fileInfo.score += 10;
        if (fileExt === '.md') fileInfo.score += 10;

        allFiles.push(fileInfo);
      }
    }
  }

  return allFiles;
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
        comments: [],
        functions: [],
        classes: [],
        sample: config.includeStructureOnly ? null : sampleLines.join('\n')
      };

      // Simple pattern matching to count code structures
      for (const line of lines) {
        if (line.match(/function\s+\w+\s*\(/)) {
          analysis.functionCount++;
          analysis.functions.push(line.trim());
        }
        if (line.match(/class\s+\w+/)) {
          analysis.classCount++;
          analysis.classes.push(line.trim());
        }
        if (line.match(/import\s+|require\(/)) analysis.importCount++;
        if (line.match(/\/\/|\/\*|#|--/)) {
          analysis.comments.push(line.trim());
        }
      }

      projectInfo.fileAnalysis.push(analysis);
    } catch (err) {
      // Skip files we can't read
      console.error(`Error reading file ${file.path}: ${err.message}`);
    }
  }
}

export {
  generateMinimalPrompt
};

