const fs = require('fs');
const path = require('path');

class Logger {
  constructor(baseDir = './logs') {
    this.baseDir = baseDir;
    this.currentFolder = null;
    this.currentFile = null;
    this.ensureBaseDir();
  }

  ensureBaseDir() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  createFolder() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentFolder = path.join(this.baseDir, `logs_${timestamp}`);
    
    if (!fs.existsSync(this.currentFolder)) {
      fs.mkdirSync(this.currentFolder, { recursive: true });
    }
    
    console.log(`Created folder: ${this.currentFolder}`);
    return this.currentFolder;
  }

  createLogFile() {
    if (!this.currentFolder) {
      this.createFolder();
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentFile = path.join(this.currentFolder, `log_${timestamp}.log`);
    
    return this.currentFile;
  }

  writeLog(message, type = 'INFO') {
    if (!this.currentFile) {
      this.createLogFile();
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}\n`;
    
    fs.appendFileSync(this.currentFile, logEntry);
    return logEntry;
  }

  static parseLogFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    
    return lines.map(line => {
      const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/);
      if (match) {
        return {
          timestamp: match[1],
          type: match[2],
          message: match[3]
        };
      }
      return null;
    }).filter(log => log !== null);
  }

  static getAllLogFiles(baseDir = './logs') {
    const logFiles = [];
    
    if (!fs.existsSync(baseDir)) {
      return logFiles;
    }

    const folders = fs.readdirSync(baseDir);
    
    for (const folder of folders) {
      const folderPath = path.join(baseDir, folder);
      const stat = fs.statSync(folderPath);
      
      if (stat.isDirectory()) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          if (file.endsWith('.log')) {
            logFiles.push(path.join(folderPath, file));
          }
        }
      }
    }
    
    return logFiles;
  }
}

module.exports = Logger;