const asyncReplace = require('string-replace-async')

const pkg = require('./package.json')
const { checkAuth } = require('./util/auth')
const { createPostHTML } = require('./util/posts')

const embedPosts = async function embedPosts(content, options) {}

const defaultOptions = {
  mode: 'full',
  cache: true,
  cacheDir: '.cache',
  imageOptions: {
    outputDir: './_site/img/',
  },
}

module.exports = function (eleventyConfig, userOptions) {
  try {
    eleventyConfig.versionCheck(pkg['11ty'].compatibility)
  } catch (e) {
    console.log(
      `WARN: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}`,
    )
  }

  let options = { ...defaultOptions, ...userOptions }

  eleventyConfig.addTransform('embedMastodonPosts', async function (content) {
    let postRegExp = /<p ?.*>mastodon:(\d*)<\/p>/gm

    if (checkAuth(options)) {
      return await asyncReplace(content, postRegExp, async (match, id) => {
        console.log('🧑‍🔬', options.host, id)

        return await createPostHTML(id, options)
      })
    }

    console.error(
      'Plugin Embed Mastodon: Auth check unsuccessful. Returning content.',
    )

    return content
  })
}
