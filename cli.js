#!/usr/bin/env node
const { generateMinimalPrompt } = require('./analyzer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Command line options parser
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    projectPath: null,
    outputFile: null,
    structureOnly: false,
    maxFiles: 15,
    maxLines: 50,
    help: false,
    version: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (arg === '--structure-only' || arg === '-s') {
      options.structureOnly = true;
    } else if (arg === '--output' || arg === '-o') {
      options.outputFile = args[++i];
    } else if (arg === '--max-files' || arg === '-f') {
      options.maxFiles = parseInt(args[++i], 10);
    } else if (arg === '--max-lines' || arg === '-l') {
      options.maxLines = parseInt(args[++i], 10);
    } else if (!options.projectPath) {
      options.projectPath = arg;
    }
  }
  
  return options;
}

// Display help information
function showHelp() {
  console.log(`
Claude Project Analyzer - Generate minimal prompts for Claude.AI

Usage: claude-analyzer <project-path> [options]

Options:
  -h, --help          Show this help message
  -v, --version       Display version information
  -o, --output FILE   Write output to FILE instead of stdout
  -s, --structure-only  Only include structure info, no code samples
  -f, --max-files N   Maximum number of files to analyze (default: 15)
  -l, --max-lines N   Maximum lines per file to include (default: 50)

Example:
  claude-analyzer ./my-project -o prompt.md -s
  `);
}

// Show version
function showVersion() {
  console.log('Claude Project Analyzer v1.0.0');
}

// Count total project size recursively
function countTotalProjectSize(dirPath, ignorePaths = ['node_modules', '.git', 'dist', 'build']) {
  let totalSize = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      // Skip ignored directories
      if (ignorePaths.includes(item)) {
        continue;
      }
      
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        totalSize += countTotalProjectSize(fullPath, ignorePaths);
      } else if (stats.isFile()) {
        // Only count text files that would realistically be included in a prompt
        const ext = path.extname(item).toLowerCase();
        const textFileExts = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', 
                             '.h', '.cs', '.php', '.rb', '.go', '.html', '.css', '.json',
                             '.md', '.txt', '.xml', '.sql', '.yaml', '.yml'];
        
        if (textFileExts.includes(ext)) {
          try {
            // Get actual file size if possible
            const content = fs.readFileSync(fullPath, 'utf8');
            totalSize += content.length;
          } catch (err) {
            // If we can't read the file, estimate based on stats
            totalSize += stats.size;
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}: ${err.message}`);
  }
  
  return totalSize;
}

// Calculate token savings
function calculateTokenSavings(content, projectPath) {
  // Calculate tokens in the current content
  const tokenCount = Math.ceil(content.length / 4);
  
  // Calculate tokens that would have been used without optimization
  const estimatedFullSize = countTotalProjectSize(projectPath);
  const fullTokenCount = Math.ceil(estimatedFullSize / 4);
  
  // Calculate savings
  const tokensSaved = fullTokenCount - tokenCount;
  const savingsPercent = fullTokenCount > 0 
    ? (tokensSaved / fullTokenCount * 100).toFixed(1)
    : 0;
    
  return {
    tokenCount,
    fullTokenCount,
    tokensSaved,
    savingsPercent
  };
}

// Save prompt to file
function saveToFile(content, filePath, projectPath) {
  const fullPath = path.resolve(filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Prompt saved to: ${fullPath}`);
  
  // Calculate and display token savings
  const { tokenCount, tokensSaved, savingsPercent } = calculateTokenSavings(content, projectPath);
  
  console.log(`Estimated tokens: ~${tokenCount}`);
  console.log(`Estimated tokens saved: ~${tokensSaved} (${savingsPercent}%)`);
  
  // Add savings info to prompt
  fs.appendFileSync(fullPath, `\n\n<!-- Token estimate: ${tokenCount} (saved ~${tokensSaved} tokens, ${savingsPercent}%) -->`, 'utf8');
}

// Main function
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  if (options.version) {
    showVersion();
    return;
  }
  
  if (!options.projectPath) {
    console.error('Error: Project path is required.');
    showHelp();
    process.exit(1);
  }
  
  // Check if path exists
  if (!fs.existsSync(options.projectPath)) {
    console.error(`Error: Directory not found: ${options.projectPath}`);
    process.exit(1);
  }
  
  try {
    console.log(`Analyzing project: ${options.projectPath}`);
    
    // Configure analysis options
    const analysisOptions = {
      maxFilesToAnalyze: options.maxFiles,
      maxLinesPerFile: options.maxLines,
      includeStructureOnly: options.structureOnly
    };
    
    // Generate prompt
    const prompt = generateMinimalPrompt(options.projectPath, analysisOptions);
    
    // Output handling
    if (options.outputFile) {
      saveToFile(prompt, options.outputFile, options.projectPath);
    } else {
      console.log('\n--- Minimal Claude Prompt ---\n');
      console.log(prompt);
      
      // Calculate and display token savings
      const { tokenCount, tokensSaved, savingsPercent } = calculateTokenSavings(prompt, options.projectPath);
      
      console.log(`\nEstimated tokens: ~${tokenCount}`);
      console.log(`Estimated tokens saved: ~${tokensSaved} (${savingsPercent}%)`);
      
      // Offer to save to file
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('\nSave to file? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          rl.question('Enter filename: ', (filename) => {
            saveToFile(prompt, filename, options.projectPath);
            rl.close();
          });
        } else {
          rl.close();
        }
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});