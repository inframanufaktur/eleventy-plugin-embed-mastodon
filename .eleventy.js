const path = require('path')
const pkg = require('./package.json')
const { checkAuth } = require('./util/auth')
const { createPostHTML } = require('./util/posts')

const defaultOptions = {
  mode: 'full',
  cache: true,
  cacheDir: '.mastodon',
  cacheDuration: '*',
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

  if (!checkAuth(options)) {
    console.error(
      'Plugin Embed Mastodon: Auth check unsuccessful. Aborting init. Check if `token` is set.',
    )

    return
  }

  eleventyConfig.addAsyncShortcode(
    'embedMastodon',
    async function (idOrLink, overwriteMode) {
      let mastodonLinkOrId =
        /(?:https:\/\/)?([\w\d\-]*?.?[\w\d\-]*.[a-z]*\/@[\w\d_]*(?:@[\w\d]*?.?[\w\d]*.[a-z]*)?\/)?(\d*)/gim

      const [fullMatch, remoteLink, id] = mastodonLinkOrId.exec(idOrLink)

      if (!fullMatch) {
        console.log(
          `Plugin Embed Mastodon: ${idOrLink} seems to be no valid Mastodon link/ID.`,
        )

        return ''
      }

      return await createPostHTML(id, remoteLink, options)
    },
  )

  eleventyConfig.addTransform('embedMastodonPosts', async function (content) {
    const { default: asyncReplace } = await import('string-replace-async')

    // https://regexr.com/77hk9
    let mastodonParagraph =
      /<p ?.*>mastodon:([\wd\-]*?.?[\wd\-]*.[a-z]*\/@[\wd_]*(?:@[\wd]*?.?[\wd]*.[a-z]*)?\/)?(\d*)<\/p>/gim

    return await asyncReplace(
      content,
      mastodonParagraph,
      async (match, remoteLink, id) => {
        return await createPostHTML(id, remoteLink, options)
      },
    )
  })

  eleventyConfig.addPassthroughCopy({
    [`${path.join(__dirname, 'lib/icons')}`]: '/img/mastodon-embed-plugin',
  })
}
