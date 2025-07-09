#!/usr/bin/env node
import { generateMinimalPrompt } from './analyzer.js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import process from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Show version
function showVersion() {
  console.log('Claude Project Analyzer v1.1.0');
}

// Count total project size recursively
function countTotalProjectSize(dirPath, ignorePaths = ['node_modules', '.git', 'dist', 'build']) {
  let totalSize = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      if (ignorePaths.includes(item)) {
        continue;
      }
      
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        totalSize += countTotalProjectSize(fullPath, ignorePaths);
      } else if (stats.isFile()) {
        const ext = path.extname(item).toLowerCase();
        const textFileExts = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', 
                              '.h', '.cs', '.php', '.rb', '.go', '.html', '.css', '.json',
                              '.md', '.txt', '.xml', '.sql', '.yaml', '.yml'];
        
        if (textFileExts.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            totalSize += content.length;
          } catch {
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
  const tokenCount = Math.ceil(content.length / 4);
  const estimatedFullSize = countTotalProjectSize(projectPath);
  const fullTokenCount = Math.ceil(estimatedFullSize / 4);
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
  
  const { tokenCount, tokensSaved, savingsPercent } = calculateTokenSavings(content, projectPath);
  
  console.log(`Estimated tokens: ~${tokenCount}`);
  console.log(`Estimated tokens saved: ~${tokensSaved} (${savingsPercent}%)`);
  
  fs.appendFileSync(fullPath, `\n\n<!-- Token estimate: ${tokenCount} (saved ~${tokensSaved} tokens, ${savingsPercent}%) -->`, 'utf8');
}

// Main function
async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 <project-path> [options]')
    .command('$0 <project-path>', 'Analyze a project and generate a prompt', (yargs) => {
      yargs.positional('project-path', {
        describe: 'The path to the project directory to analyze',
        type: 'string'
      });
    })
    .option('o', {
      alias: 'output',
      describe: 'Write output to FILE instead of stdout',
      type: 'string'
    })
    .option('s', {
      alias: 'structure-only',
      describe: 'Only include structure info, no code samples',
      type: 'boolean',
      default: false
    })
    .option('p', {
      alias: 'provider',
      describe: 'Specify the LLM provider',
      choices: ['claude', 'gemini', 'openrouter', 'litellm'],
      default: 'claude'
    })
    .option('f', {
      alias: 'max-files',
      describe: 'Maximum number of files to analyze',
      type: 'number',
      default: 15
    })
    .option('l', {
      alias: 'max-lines',
      describe: 'Maximum lines per file to include',
      type: 'number',
      default: 50
    })
    .version('v', 'Show version information', 'Claude Project Analyzer v1.1.0')
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .argv;

  if (argv.version) {
    showVersion();
    return;
  }

  const projectPath = argv.projectPath;

  if (!projectPath) {
    console.error('Error: Project path is required.');
    yargs.showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(projectPath)) {
    console.error(`Error: Directory not found: ${projectPath}`);
    process.exit(1);
  }

  try {
    console.log(`Analyzing project: ${projectPath}`);
    
    const analysisOptions = {
      maxFilesToAnalyze: argv.maxFiles,
      maxLinesPerFile: argv.maxLines,
      includeStructureOnly: argv.structureOnly,
      provider: argv.provider
    };
    
    const prompt = await generateMinimalPrompt(projectPath, analysisOptions);
    
    if (argv.output) {
      saveToFile(prompt, argv.output, projectPath);
    } else {
      console.log('\n--- Minimal Prompt ---\n');
      console.log(prompt);
      
      const { tokenCount, tokensSaved, savingsPercent } = calculateTokenSavings(prompt, projectPath);
      
      console.log(`\nEstimated tokens: ~${tokenCount}`);
      console.log(`Estimated tokens saved: ~${tokensSaved} (${savingsPercent}%)`);
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('\nSave to file? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          rl.question('Enter filename: ', (filename) => {
            saveToFile(prompt, filename, projectPath);
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

main().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
