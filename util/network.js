const { default: got } = require('got/dist/source')
const { getAuthHeader } = require('./auth')

function makePostURL(id, { host, apiVersion }) {
  return `https://${host}/api/${apiVersion}/statuses/${id}`
}

function makeSearch(search, { host, apiVersion }) {
  return `https://${host}/api/${apiVersion}/search?q=${search}&resolve=true`
}

function getById(id, host, token, apiVersion = 'v1') {
  return got(makePostURL(id, { host, apiVersion }), {
    headers: {
      ...getAuthHeader(token, apiVersion),
    },
  })
}

function getBySearch(remoteLink, id, { token, host }, apiVersion = 'v2') {
  const searchURL = makeSearch(`https://${remoteLink}/${id}`, {
    host,
    apiVersion,
  })

  return got(searchURL, {
    headers: {
      ...getAuthHeader(token, apiVersion),
    },
  })
}

async function fetchPost(id, remoteLink, { host, bearer } = {}) {
  const isOnOwnInstance = !remoteLink || remoteLink.includes('host')

  console.log('🧑‍🔬 fetchPost:', id, remoteLink, isOnOwnInstance)

  if (isOnOwnInstance) {
    return getById(id, host, bearer)
  }

  return getBySearch(remoteLink, id, { token: bearer, host })
}

module.exports = { makePostURL, fetchPost }
