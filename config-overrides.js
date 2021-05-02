const {
  override,
  addBabelPlugin,
  addLessLoader,
} = require('customize-cra');

module.exports = (config, env) => {
  const plugins = [];

  if (env === 'development') {
    plugins.push('react-hot-loader/babel');
    plugins.push('@babel/plugin-syntax-dynamic-import');
  }

  return override(
    addLessLoader({
      // javascriptEnabled: true,
      // modifyVars: {
      //   "primary-color": "#007ED4",
      // },
    }),
    ...plugins.map((plugin) => addBabelPlugin(plugin)),
  )(config, env);
};
