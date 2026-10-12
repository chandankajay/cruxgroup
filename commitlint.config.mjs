/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "scope-jira": ({ scope }) => [
          Boolean(scope && /^[A-Z]+-\d+$/.test(scope)),
          `scope must be a Jira id like CWA-53 (got: ${scope ?? "empty"})`,
        ],
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "refactor",
        "perf",
        "docs",
        "test",
        "ci",
        "hotfix",
      ],
    ],
    "scope-empty": [2, "never"],
    "scope-jira": [2, "always"],
    "scope-case": [0],
    "subject-case": [0],
  },
};
