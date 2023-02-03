const asyncReplace = require('string-replace-async')
const path = require('path')
const pkg = require('./package.json')
const { checkAuth } = require('./util/auth')
const { createPostHTML } = require('./util/posts')

// const POST_MATCHER = //

const defaultOptions = {
  mode: 'full',
  cache: true,
  cacheDir: '.mastodon',
  cacheDuration: '1y',
  statusApiVersion: 'v1',
  searchApiVersion: 'v2',
}

const defaultImageOptions = {
  outputDir: './_site/img/',
}

module.exports = function (eleventyConfig, { baseOptions, imageOptions }) {
  try {
    eleventyConfig.versionCheck(pkg['11ty'].compatibility)
  } catch (e) {
    console.log(
      `WARN: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}`,
    )
  }

  let options = {
    ...defaultOptions,
    ...baseOptions,
    imageOptions: { ...defaultImageOptions, ...imageOptions },
  }

  eleventyConfig.addTransform('embedMastodonPosts', async function (content) {
    let mastodonParagraph =
      /<p ?.*>mastodon:([\w\d]*?.?[\w\d]*.[a-z]*\/@[\w\d_]*\/)?(\d*)<\/p>/gim

    if (checkAuth(options)) {
      return await asyncReplace(
        content,
        mastodonParagraph,
        async (match, remoteLink, id) => {
          return await createPostHTML(id, remoteLink, options)
        },
      )
    }

    console.error(
      'Plugin Embed Mastodon: Auth check unsuccessful. Returning content.',
    )

    return content
  })

  eleventyConfig.addPassthroughCopy({
    [`${path.join(__dirname, 'lib/icons')}`]: '/img/mastodon-embed-plugin',
  })
}
