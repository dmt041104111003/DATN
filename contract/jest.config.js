/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testTimeout: 60000,
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
