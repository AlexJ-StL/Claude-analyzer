export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^(@/.*)\\.js$': '$1',
    '^~/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  collectCoverageFrom: [
      '**/*.{js,jsx}',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/vendor/**',
    ],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    setupFilesAfterEnv: [
      '<rootDir>/jest.setup.js',
      'jest-fetch-mock/setupJest'
    ],
};