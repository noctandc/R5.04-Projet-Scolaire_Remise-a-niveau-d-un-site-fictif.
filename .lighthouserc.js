const puppeteer = require('puppeteer');

module.exports = {
  ci: {
    collect: {
      chromePath: puppeteer.executablePath(),

      startServerCommand: 'set BROWSER=none && npm run dev',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless'
      },
      startServerReadyTimeout: 20000
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }], //0.8
        'categories:accessibility': ['error', { minScore: 1 }], //1
        'categories:best-practices': ['error', { minScore: 0.9 }], //0.9
        'categories:seo': ['error', { minScore: 0.8 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
