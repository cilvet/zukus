module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Disable the built-in react-compiler, we'll configure it manually
          "react-compiler": false,
        },
      ],
    ],
    plugins: [
      [
        "babel-plugin-react-compiler",
        {
          compilationMode: "all",
          panicThreshold: "all_errors",
          // Only compile files inside the app source
          sources: (filename) => {
            // Exclude node_modules
            if (filename.includes("node_modules")) {
              return false;
            }
            // Exclude packages/core
            if (filename.includes("/packages/")) {
              return false;
            }
            // Only compile .tsx and .ts files in apps/zukus
            if (!filename.includes("/apps/zukus/")) {
              return false;
            }
            return filename.endsWith(".tsx") || filename.endsWith(".ts");
          },
        },
      ],
    ],
  };
};
