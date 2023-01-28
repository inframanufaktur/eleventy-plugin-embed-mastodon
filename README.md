# @inframanufaktur/eleventy-plugin-embed-mastodon

Embed Mastodon posts in your Eleventy pages.

Supports two modes: `full` and `quote`. Full mode is a «classic» emded, and quote renders a reduced blockquote.

The plugin parses all images through `@11ty/eleventy-img`.

0 client-side JavaScript. Posts are cached (soon).

## Configuration

Configure the plugin by passing in an object with basic options and options for image processing:

### `baseOptions`

```js
type baseOptions = {
  host: string,
  bearer: string,
  mode?: 'full' | 'quote',
  cache?: boolean,
  cacheDir?: string,
}
```

- host: Your instance. E.g. `front-end.social` or `lgbtqia.space`. Domain name plus TLD only.
- bearer: Access token

#### Default value

- `mode`: `full`, renders complete embed code. `quote` renders a reduced blockquote
- `cache`: `true`
- `cacheDir`: `.cache`

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

## Usage

### Shortcode

NotImplementedError.

### Transform

The plugin picks up all paragraphs which have `mastodon:123456789` as their only content, where `123456789` is a post ID.

## Federation Gotchas

The federated nature of Mastodon requires some things to keep in mind:

### IDs

IDs are unique for each server. For the embed to work you’ll need to use the ID shown on your instance, not the one of the original post URL.

## To Do

- [ ] Finish image configuration
- [ ] Quote mode
- [ ] Overwrite config mode for single posts through shortcode/transform
- [ ] Error handling
- [ ] Shortcode
- [ ] Post caching
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
