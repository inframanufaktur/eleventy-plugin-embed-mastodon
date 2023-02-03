# @inframanufaktur/eleventy-plugin-embed-mastodon

Embed Mastodon posts in your Eleventy pages.

Supports two modes: `full` and `quote` (coming soon). Full mode is a «classic» emded, and quote renders a reduced blockquote.

The plugin parses all images through `@11ty/eleventy-img`.

## Features

- Completely static embed, no client side JS
- Support for posts on remote instances through Mastodon’s search API
- Post requests are cached
- Images are parsed through 11ty’s image platform

## Usage

The plugin can work with posts in the following formats:

```bash
dair-community.social/@KimCrayton1/109766923696372660

https://dair-community.social/@KimCrayton1/109766923696372660 # shortcode only

mastodon.dair-community.social/@KimCrayton1/109766923696372660

chaos.social/@koalie@mastodon.social/109800699318730970

https://chaos.social/@koalie@mastodon.domain.social/109800699318730970 # shortcode only

109756523208056473
```

Note: ID only works only with posts from the instance which has been specified as `host` in the options, the `token` must be valid on this instance.

### Using posts from other remotes

If you add a full instance link, the plugin will look up the status via search:

```
mastodon:dair-community.social/@KimCrayton1/109766923696372660
```

### Shortcode

```njk
{% embedMastodon 'https://dair-community.social/@KimCrayton1/109766923696372660' %}
```

Note: Any of the formats from above works.

### Transform

Caveat: If you want to use transforms, you _must_ omit `https://`. The reason is that I don’t want to maintain a reg exp that parses the links.

Mark the paragraph you want to transform with `mastodon:`. This is needed because there’s no way to know if something link like might be a Mastodon instance.

Example:

```bash
mastodon:109756061321167818

mastodon:dair-community.social/@KimCrayton1/109766923696372660
```

## Configuration

Configure the plugin by passing in an object with basic options and options for image processing:

### `baseOptions`

```js
type baseOptions = {
  host: string,
  token: string,
  mode?: 'full' | 'quote',
  cacheDir?: string,
  cacheDuration?: string,
}
```

- host: Your instance. E.g. `front-end.social` or `lgbtqia.space`. Domain name plus TLD only.
- token: Access token

#### Default values

- `mode`: `full`, renders complete embed code. `quote` renders a reduced blockquote
- `cacheDir`: `.mastodon`
- `cacheDuration`: `1y` (profile pictures are saved for 2 weeks)

### `imageOptions`

```js
type imageOptions = {
  outputDir?: string,
  urlPath?: string,
}
```

#### Default values

- `outputDir`: './\_site/img/'. You _need_ to change this if your dist folder is not `_site`
- `urlPath`: '/img/'.

### Styling

You can import `@inframanufaktur/eleventy-plugin-embed-mastodon/post.css` for default styles which mirror the Mastodon design.

## Federation Gotchas

The federated nature of Mastodon requires some things to keep in mind:

### IDs

IDs are unique for each server. If you want to embed by ID, you need to copy the ID from your server. Otherwise use the full link so that the plugin can perform a search.

## To Do

- [ ] Finish image configuration
- [ ] Quote mode
- [ ] Overwrite config mode for single posts through shortcode/transform
- [ ] Error handling
- [x] Shortcode
- [x] Post caching
- [ ] Images
- [ ] Content Warnings

## FAQ

### Obtain an access token

- Open the web interface of your instance
- Go to Preferences -> Development
- Use the «New Application» button
- Enter a name (redirect URI can stay on the default value)
- Select `read` scope, we don’t need anything else
- Activate «Submit» button
- On the application overview select your application
- Copy the value behind «Your access token»
- Add this value to your `.env`. **Never commit tokens to source control.**
