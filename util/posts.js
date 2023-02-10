const { minify } = require('html-minifier')
const { handleAttachment } = require('./attachments')
const { postVisibilityAllowsEmbed } = require('./auth')
const { fetchPost } = require('./network')

const minifyOptions = {
  collapseWhitespace: true,
}

function getPostData(postData) {
  if (postData.statuses) {
    return postData.statuses[0]
  }

  return postData
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

function getIconClass(name) {
  return `mastodon-embed__has-icon -is-icon-${name}`
}

function getApp(application) {
  if (!application) {
    return ''
  }
  const { website, name } = application

  return `<span class="mastodon-embed__application">${
    website ? `<a href="${website}">` : ''
  }${name}${website ? '</a>' : ''}</span>`
}

async function renderHeader(
  { display_name, acct, avatar, url },
  imageOptions,
  { directory },
) {
  return `<header class="mastodon-embed__header">
    ${await handleAttachment(
      { url: avatar, description: '' },
      { ...imageOptions, sizes: '2.875rem' },
      { directory, duration: '2w' },
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
  application,
  url,
}) {
  return `<footer class="mastodon-embed__footer">
    <span class="mastodon-embed__timestamp"><a href="${url}">
      <time datetime="${created_at}">${parseTimestamp(created_at)}</time>
    </a></span>
    <span class="mastodon-embed__visibility ${getIconClass(
      visibility,
    )}" aria-label=${visibility}></span>
    ${getApp(application)}
    <span class="mastodon-embed__replies ${getIconClass(
      'replies',
    )}">${replies_count}</span>
    <span class="mastodon-embed__reblogs ${getIconClass(
      'reblogs',
    )}">${reblogs_count}</span>
    <span class="mastodon-embed__favourites ${getIconClass(
      'favs',
    )}">${favourites_count}</span>
  </footer>`
}

async function createPostHTML(id, remoteLink, options) {
  const postData = await fetchPost(id, remoteLink, options)

  const { url, content, media_attachments, account, visibility } = postData

  if (!postVisibilityAllowsEmbed(visibility)) {
    console.error(
      `Plugin Embed Mastodon: Post ${url} has visibility settings that do not allow embed.`,
    )

    return
  }

  return `<article class="mastodon-embed">
    ${await renderHeader(account, options.imageOptions, {
      duration: options.cacheDuration,
      directory: options.cacheDir,
    })}
    <section class="mastodon-embed__content">${content}</section>
    ${renderFooter(postData)}
  </article>`
}

module.exports = { createPostHTML }
