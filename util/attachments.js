const Image = require('@11ty/eleventy-img')

const parserDefaults = {
  formats: new Map([
    ['png', ['avif', 'webp', 'png']],
    ['gif', ['webp', 'png']],
  ]),
}

const defaultFormats = ['avif', 'webp', 'jpg']

const defaultAttributes = { loading: 'lazy', decoding: 'async' }

/**
 *
 *
 * @param {string} url The whole asset URL
 * @return {string} File extension
 */
function getFileExtension(url) {
  const splitted = url.split('.')

  return splitted[splitted.length - 1]
}

/**
 * Parse single attachment through @11ty/eleventy-img
 *
 * @param {object} attachment
 * @param {string} attachment.url
 * @param {string | null} attachment.description
 */
async function handleAttachment(attachment, imageOptions, cacheOptions = {}) {
  const { description, url } = attachment

  if (description === null) {
    console.warn(
      `Plugin Mastodon: Media Attachment ${attachment.url} has no \`alt\` text`,
    )
  }

  const formats =
    parserDefaults.formats.get(getFileExtension(url)) ?? defaultFormats

  const parsed = await Image(url, {
    ...imageOptions,
    formats,
    cacheOptions,
  })
  const imageAttributes = {
    ...defaultAttributes,
    // set alt to an empty string as we are in no position to change this and have warned before
    alt: description ?? '',
    sizes: imageOptions.sizes ?? '100%',
  }

  return Image.generateHTML(parsed, imageAttributes)
}

/**
 * Get image HTML for all image attachments
 *
 * @param {Array} mediaAttachments
 */
async function handleAttachments(mediaAttachments) {
  return Promise.all(
    mediaAttachments
      .filter(({ type }) => type === 'image')
      .map((attachment) => handleAttachment(attachment)),
  )
}

module.exports = { handleAttachment, handleAttachments }
