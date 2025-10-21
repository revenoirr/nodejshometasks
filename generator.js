const Logger = require('./logger');

class LogGenerator {
  constructor() {
    this.logger = new Logger('./logs');
    this.logTypes = ['SUCCESS', 'ERROR', 'WARNING', 'INFO'];
    this.messages = [
      'User authentication successful',
      'Database connection established',
      'API request completed',
      'File upload failed',
      'Network timeout occurred',
      'Cache cleared successfully',
      'Invalid input parameters',
      'Service started',
      'Configuration loaded',
      'Memory usage high'
    ];
  }

  generateRandomLog() {
    const type = this.logTypes[Math.floor(Math.random() * this.logTypes.length)];
    const message = this.messages[Math.floor(Math.random() * this.messages.length)];
    
    this.logger.writeLog(message, type);
    console.log(`Generated log: [${type}] ${message}`);
  }

  start() {
    console.log('Log Generator Started');
    console.log('Creating folders every 60 seconds');
    console.log('Creating log files every 10 seconds');
    console.log('Press Ctrl+C to stop\n');

    this.logger.createFolder();
    this.logger.createLogFile();

    for (let i = 0; i < 5; i++) {
      this.generateRandomLog();
    }

    setInterval(() => {
      this.logger.createLogFile();
      console.log(`\n✓ Created new log file`);

      const numLogs = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < numLogs; i++) {
        this.generateRandomLog();
      }
    }, 10000);

    setInterval(() => {
      this.logger.createFolder();
      this.logger.createLogFile();
      console.log(`\n✓ Created new folder and log file`);

      const numLogs = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < numLogs; i++) {
        this.generateRandomLog();
      }
    }, 60000);
  }
}

const generator = new LogGenerator();
generator.start();