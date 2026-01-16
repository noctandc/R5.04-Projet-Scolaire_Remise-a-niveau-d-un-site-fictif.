module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/backend/**/*.test.js'],
      transform: {
        '^.+\\.js$': 'babel-jest'
      }
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: ['<rootDir>/packages/frontend/**/*.test.js'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime.js',
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom',
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
      }
    }
  ],
  collectCoverageFrom: [
    'packages/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/public/**'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 60,
      functions: 70,
      lines: 80
    }
  }
};
