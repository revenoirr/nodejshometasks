const Logger = require('./logger');

class LogAnalyzer {
  constructor(filterType = null) {
    this.filterType = filterType ? filterType.toUpperCase() : null;
    this.stats = {
      SUCCESS: 0,
      ERROR: 0,
      WARNING: 0,
      INFO: 0,
      total: 0
    };
    this.logs = [];
  }

  analyze() {
    console.log('Log Analyzer Started\n');
    
    const logFiles = Logger.getAllLogFiles('./logs');
    
    if (logFiles.length === 0) {
      console.log('No log files found.');
      return;
    }

    console.log(`Found ${logFiles.length} log file(s)\n`);

    for (const filePath of logFiles) {
      const logs = Logger.parseLogFile(filePath);
      this.logs.push(...logs);
    }

    for (const log of this.logs) {
      if (this.stats.hasOwnProperty(log.type)) {
        this.stats[log.type]++;
      }
      this.stats.total++;
    }

    this.displayResults();
  }

  displayResults() {
    console.log('STATISTICS');

    if (this.filterType) {
      console.log(`🔍 Filter: ${this.filterType} logs only\n`);
    }

    console.log(`Total Logs: ${this.stats.total}`);
    console.log(` SUCCESS:  ${this.stats.SUCCESS} (${this.getPercentage('SUCCESS')}%)`);
    console.log(` ERROR:    ${this.stats.ERROR} (${this.getPercentage('ERROR')}%)`);
    console.log(` WARNING:  ${this.stats.WARNING} (${this.getPercentage('WARNING')}%)`);
    console.log(` INFO:     ${this.stats.INFO} (${this.getPercentage('INFO')}%)`);

    if (this.filterType) {
      const filteredLogs = this.logs.filter(log => log.type === this.filterType);
      
      console.log(`\n📋 ${this.filterType} Logs (${filteredLogs.length} entries):`);     
      if (filteredLogs.length > 0) {
        filteredLogs.forEach((log, index) => {
          console.log(`${index + 1}. [${log.timestamp}] ${log.message}`);
        });
      } else {
        console.log(`No ${this.filterType} logs found.`);
      }
    }
  }

  getPercentage(type) {
    if (this.stats.total === 0) return 0;
    return ((this.stats[type] / this.stats.total) * 100).toFixed(1);
  }
}

const args = process.argv.slice(2);
let filterType = null;

if (args.length > 0) {
  if (args[0] === '--type' && args[1]) {
    filterType = args[1];
  } else if (args[0].startsWith('--type=')) {
    filterType = args[0].split('=')[1];
  } else {
    console.log('Usage: node analyzer.js [--type=SUCCESS|ERROR|WARNING|INFO]');
    console.log('Example: node analyzer.js --type=ERROR\n');
  }
}

const analyzer = new LogAnalyzer(filterType);
analyzer.analyze();