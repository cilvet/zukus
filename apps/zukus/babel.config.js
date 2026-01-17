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
          // Only compile React components (.tsx files in apps/zukus)
          sources: (filename) => {
            if (filename.includes("node_modules")) return false;
            if (filename.includes("/packages/")) return false;
            if (!filename.includes("/apps/zukus/")) return false;
            // Excluir archivos de skills con memoización manual
            if (filename.includes("SkillRow")) return false;
            if (filename.includes("SkillsSection")) return false;
            if (filename.includes("AbilitiesSection")) return false;
            return filename.endsWith(".tsx");
          },
        },
      ],
    ],
  };
};
