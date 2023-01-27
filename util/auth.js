/**
 * Check if Bearer is in options
 *
 * @param {object} options
 * @param {string} options.bearer
 */
function checkAuth(options) {
  return Object.getOwnPropertyNames(options).includes('bearer')
}

module.exports = { checkAuth }
