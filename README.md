# Webpage to Image

A simple webservice that takes webpages into images using the headless Chrome API.

## Usage

The following query parameters can be passed:

- **url** — The url to capture.
- **width** — Sets the viewport width. Defaults to `1920`.
- **height** — Sets the viewport height. Defaults to `1080`.
- **timeout** <number> Wait for a certain amount of milliseconds before capturing the page. Defaults to `0`.
- **type** <string> Specify screenshot type, can be either jpeg or png. Defaults to 'png'.
- **quality** <number> The quality of the image, between 0-100. Not applicable to png images.
- **fullPage** <boolean> When true, takes a screenshot of the full scrollable page. Defaults to false.
- **clipX** <number> x-coordinate of top-left corner of clip area
- **clipY** <number> y-coordinate of top-left corner of clip area
- **clipWidth** - <number> width of clipping area
- **clipHeight** - <number> height of clipping area
- **omitBackground** - <boolean> Hides default white background and allows capturing screenshots with transparency. Defaults to false.
- **download** — Prompt download. Defaults to `false`.
- **filename** — When `?download=true` is applied, the filename is by default `download.png`. You can change this by passing `?filename=random_filename.png` another filename.

**Example urls:**

http://0.0.0.0:5015/image?url=https://github.com&width=375&height=821&quality=10&type=jpg&download=true&filename=fancy_filename.jpg