/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: [
    "../docs/Get Started.mdx",
    "../docs/**/*.mdx",
    "../**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-mdx-gfm"
  ],

  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },

  docs: {
    defaultName: "Demo"
  },
};
export default config;
