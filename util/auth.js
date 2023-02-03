/**
 * Check if Bearer is in options
 *
 * @param {object} options
 * @param {string} options.token
 */
function checkAuth(options) {
  return (
    Object.getOwnPropertyNames(options).includes('token') &&
    typeof options.token === 'string' &&
    options.token.length > 1
  )
}

function getAuthHeader(token, apiVersion) {
  return apiVersion === 'v1'
    ? { Bearer: token }
    : { Authorization: `Bearer ${token}` }
}

function postVisibilityAllowsEmbed(visibility) {
  return ['public', 'unlisted'].includes(visibility)
}

module.exports = { checkAuth, getAuthHeader, postVisibilityAllowsEmbed }
