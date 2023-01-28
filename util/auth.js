/**
 * Check if Bearer is in options
 *
 * @param {object} options
 * @param {string} options.bearer
 */
function checkAuth(options) {
  return Object.getOwnPropertyNames(options).includes('bearer')
}

function getAuthHeader(token, apiVersion) {
  return apiVersion === 'v1'
    ? { Bearer: token }
    : { Authorization: `Bearer ${token}` }
}

module.exports = { checkAuth, getAuthHeader }
