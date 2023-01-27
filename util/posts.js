const { minify } = require('html-minifier')
const { handleAttachment } = require('./attachments')
const { fetchPost } = require('./network')

const minifyOptions = {
  collapseWhitespace: true,
}

function parsePostResponse(postData) {
  return JSON.parse(postData)
}

function parseTimestamp(dateString) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateString))
}

async function renderHeader({ display_name, acct, avatar, url }, imageOptions) {
  return `<header class="mastodon-embed__header">
    ${await handleAttachment(
      { url: avatar, description: '' },
      { ...imageOptions, sizes: '2.875rem' },
    )}
    <div class="mastodon-embed__profile-information">
      <p><a href="${url}"><span class="mastodon-embed__display-name">${display_name}</span></a><br />
      <span class="mastodon-embed__account-name">@${acct}</span></p>
    </div>
  </header>`
}

function renderFooter({
  created_at,
  favourites_count,
  reblogs_count,
  replies_count,
  visibility,
  url,
}) {
  return `<footer class="mastodon-embed__footer">
    <span class="mastodon-embed__timestamp"><a href="${url}">${parseTimestamp(
    created_at,
  )}</a></span>
    <span class="mastodon-embed__visibility">${visibility}</span>
    <span class="mastodon-embed__replies">${replies_count}</span>
    <span class="mastodon-embed__reblogs">${reblogs_count}</span>
    <span class="mastodon-embed__favourites">${favourites_count}</span>
  </footer>`
}

async function createPostHTML(id, options) {
  const { body } = await fetchPost(id, options)

  const postData = parsePostResponse(body)
  const { url, content, media_attachments, account } = postData

  console.log('🧑‍🔬', url, media_attachments.length)

  return minify(
    `<article class="mastodon-embed">
    ${await renderHeader(account, options.imageOptions)}
    ${content}
    ${renderFooter(postData)}
  </article>`,
    minifyOptions,
  )
}

module.exports = { createPostHTML }
