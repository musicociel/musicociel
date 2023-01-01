import purgeCss from "@fullhuman/postcss-purgecss";

export default ({ env }) => ({
  plugins: [
    env === "production"
      ? purgeCss({
          content: ["src/**/*.svelte"],
          safelist: {
            standard: [/^svelte-/, "html", "body"]
          }
        })
      : false
  ]
});
