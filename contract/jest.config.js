/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testTimeout: 60000,
    testEnvironment: "node",
    setupFiles: ["./jest.setup.js"],
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {
            useESM: false,
        }],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
