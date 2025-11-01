module.exports = {
  // Transform all JS except for node_modules, but include axios for transformation
  transformIgnorePatterns: [
    "/node_modules/(?!(axios)/)"
  ],
};
