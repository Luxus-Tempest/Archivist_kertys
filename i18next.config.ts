export default {
  locales: [
    "en",
    "fr",
    "es"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "public/locales/{{language}}/{{namespace}}.json"
  }
}