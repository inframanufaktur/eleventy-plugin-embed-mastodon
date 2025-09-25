const EleventyFetch = require('@11ty/eleventy-fetch')
const { getAuthHeader } = require('./auth')

function makePostURL(id, { host, statusApiVersion = 'v1' }) {
  return `https://${host}/api/${statusApiVersion}/statuses/${id}`
}

function makeSearch(search, { host, searchApiVersion = 'v2' }) {
  return `https://${host}/api/${searchApiVersion}/search?q=${search}&resolve=true`
}

function fetchURL(url, { cacheDir, cacheDuration, token, apiVersion }) {
  return EleventyFetch(url, {
    duration: cacheDuration,
    directory: cacheDir,
    type: 'json',
    returnType: undefined,
    fetchOptions: {
      headers: {
        ...getAuthHeader(token, apiVersion),
      },
    },
  })
}

function getById(id, options) {
  return fetchURL(makePostURL(id, options), {
    ...options,
    apiVersion: options.statusApiVersion,
  })
}

async function getBySearch(remoteLink, id, options) {
  const searchURL = makeSearch(`https://${remoteLink}/${id}`, options)

  const { statuses } = await fetchURL(searchURL, {
    ...options,
    apiVersion: options.searchApiVersion,
  })

  return statuses[0]
}

async function fetchPost(id, remoteLink, options) {
  const isOnOwnInstance = !remoteLink || remoteLink.startsWith(options.host)

  if (isOnOwnInstance) {
    return getById(id, options)
  }

  return getBySearch(remoteLink, id, options)
}

module.exports = { makePostURL, fetchPost, fetchURL }
