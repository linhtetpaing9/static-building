/* eslint-disable */
const withLess = require('@zeit/next-less')
const withCss = require('@zeit/next-css')
const withPlugins = require('next-compose-plugins');

const nextConfiguration = {
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  // future: {
  //   webpack5: false
  // }
};

module.exports = withPlugins([
  withLess,
  withCss,
], nextConfiguration);