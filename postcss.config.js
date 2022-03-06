module.exports = ({ env }) => ({
  plugins: [
    env === "production"
      ? require("@fullhuman/postcss-purgecss")({
          content: ["src/**/*.svelte"],
          safelist: {
            standard: [/^svelte-/, "html", "body"]
          }
        })
      : false
  ]
});
