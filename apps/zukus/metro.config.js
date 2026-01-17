const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Allow .cjs files
config.resolver.sourceExts.push("cjs");

module.exports = config;
