const fs = require('node:fs')
const path = require('node:path')

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
 * Escape a string for use in an HTML attribute
 *
 * @param {string} value
 */
function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/**
 * Fallback to the original image URL when processing through
 * @11ty/eleventy-img fails, e.g. when a remote asset is gone (404).
 * A single dead avatar must not fail the whole site build.
 *
 * @param {string} url
 * @param {string} alt
 */
function fallbackImage(url, alt) {
  return `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(
    alt,
  )}" loading="lazy" decoding="async">`
}

/**
 * Process an image through @11ty/eleventy-img.
 * Retries once after removing a stale cache file: cache entries written
 * by older eleventy-fetch versions lack the `type` metadata and fail
 * every read with "Missing cache type" instead of refetching.
 */
async function processImage(url, options, cacheOptions) {
  try {
    // failOnError: eleventy-img resolves `undefined` on errors by default,
    // which only surfaces later as a cryptic crash in generateHTML.
    return await Image(url, {
      ...options,
      cacheOptions,
      failOnError: true,
    })
  } catch (error) {
    const staleCache = parseStaleCachePath(error, cacheOptions)

    if (!staleCache) {
      throw error
    }

    console.warn(
      `Plugin Mastodon: Removing stale cache file ${staleCache} and retrying.`,
    )

    // ignore ENOENT: the same file may be processed in parallel and
    // already removed by a concurrent retry.
    await fs.promises.unlink(staleCache).catch((unlinkError) => {
      if (unlinkError.code !== 'ENOENT') {
        throw unlinkError
      }
    })

    return Image(url, {
      ...options,
      cacheOptions,
      failOnError: true,
    })
  }
}

/**
 * Extract the stale cache file path from a "Missing cache type" error.
 * Returns undefined for any other error, or when the file is outside
 * the configured cache directory (never delete those).
 */
function parseStaleCachePath(error, cacheOptions = {}) {
  const match = /Missing cache type for (.+)/.exec(error.message || '')

  if (!match) {
    return undefined
  }

  const cacheDir = path.resolve(cacheOptions.directory || '.cache')
  const cacheFile = path.resolve(match[1].trim())

  if (cacheFile !== cacheDir && !cacheFile.startsWith(`${cacheDir}/`)) {
    return undefined
  }

  if (!fs.existsSync(cacheFile)) {
    return undefined
  }

  return cacheFile
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
  const alt = description ?? ''

  if (description === null) {
    console.warn(
      `Plugin Mastodon: Media Attachment ${attachment.url} has no \`alt\` text`,
    )
  }

  const formats =
    parserDefaults.formats.get(getFileExtension(url)) ?? defaultFormats

  let parsed

  try {
    parsed = await processImage(url, { ...imageOptions, formats }, cacheOptions)
  } catch (error) {
    console.warn(
      `Plugin Mastodon: Could not process image ${url} (${error.message}). Using original URL.`,
    )

    return fallbackImage(url, alt)
  }

  if (!parsed) {
    console.warn(
      `Plugin Mastodon: Could not process image ${url}. Using original URL.`,
    )

    return fallbackImage(url, alt)
  }

  const imageAttributes = {
    ...defaultAttributes,
    // set alt to an empty string as we are in no position to change this and have warned before
    alt,
    sizes: imageOptions.sizes ?? '100%',
  }

  return Image.generateHTML(parsed, imageAttributes)
}

/**
 * Get image HTML for all image attachments
 *
 * @param {Array} mediaAttachments
 */
async function handleAttachments(
  mediaAttachments,
  imageOptions,
  cacheOptions = {},
) {
  return Promise.all(
    mediaAttachments
      .filter(({ type }) => type === 'image')
      .map((attachment) =>
        handleAttachment(attachment, imageOptions, cacheOptions),
      ),
  )
}

module.exports = { handleAttachment, handleAttachments }
