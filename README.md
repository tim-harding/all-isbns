# All ISBNs

My submission for the [Anna's Archive bounty](https://annas-archive.org/blog/all-isbns.html).

## Development

### Image generation

This site uses static image files that need to be generated before the site will function properly. The image generation requires a copy of the [compressed ISBNs file](https://software.annas-archive.li/AnnaArchivist/annas-archive/-/blob/main/isbn_images/aa_isbn13_codes_20241204T185335Z.benc.zst) and a [Rust installation](https://www.rust-lang.org/tools/install).

```sh
mkdir -p site/public/images
cd image-generator
curl -o aa_isbn13_codes.benc.zst "https://software.annas-archive.li/AnnaArchivist/annas-archive/-/raw/main/isbn_images/aa_isbn13_codes_20241204T185335Z.benc.zst?inline=false"
cargo run --release -- -i aa_isbn13_codes.benc.zst -o ../site/public/images
```

### Site

The site is built with [Vue.js](https://vuejs.org/). The development server watches for changes and updates the page automatically.

```sh
cd site
npm run dev
```

## Deployment

Build the site for production:

```sh
cd site
npm run build
```

The build output will be in `site/dist`. The contents of this folder can be hosted with any static file server. Here's the [Nginx](https://nginx.org/) configuration I use for my [demo page](http://isbn.timharding.co):

```nginx
# /etc/nginx/sites-available/isbn.timharding.co
# ln -s /etc/nginx/sites-available/isbn.timharding.co /etc/nginx/sites-enabled
server {
  server_name isbn.timharding.co;
  root /home/myuser/all-isbns/site/dist;
  index index.html;
  location / {
    sendfile on;
    tcp_nopush on;
    try_files $uri $uri/ /index.html;
  }
}
```
