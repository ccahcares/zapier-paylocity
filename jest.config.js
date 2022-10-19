module.exports = {
  rootDir: process.cwd(),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [],
  testEnvironment: 'node',
  transform: {
    "^.+\\.(t|j)sx?$" : ['@swc/jest'],
  },
}