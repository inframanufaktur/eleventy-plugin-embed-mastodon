const { default: got } = require('got/dist/source')

function makePostURL(id, { host, apiVersion }) {
  return `https://${host}/api/${apiVersion}/statuses/${id}`
}

async function fetchPost(id, { host, apiVersion = 'v1', bearer } = {}) {
  return got(makePostURL(id, { host, apiVersion }), {
    headers: {
      Bearer: bearer,
    },
  })
}

module.exports = { makePostURL, fetchPost }
