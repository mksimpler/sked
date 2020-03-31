sked
===

This Web application facilitates modifying body part scaling for Senran Kagura games such as Shinovi Versus and Estival Versus.

hacking
---

Although this repository *does* contain a `now.json` file and *can* be deployed to [ZEIT Now], you don’t actually need Now to hack it out or test it locally.

[ZEIT Now]: https://zeit.co/home

In order to try it out locally, it suffices to run a simple HTTP server from the repository’s directory. Here’s an example of how you could do it in Linux (assuming Bash):

~~~ Bash
# Step 1: Clone the repository to your computer.
git clone https://github.com/Zambonifofex/sked
cd sked

# Step 2: Start an HTTP server (Python’s in this example).
python3 -m http.server 3000 &

# Step 3: Open ‘http://localhost:3000’ in your browser.

# Step 4 (Optional): Install ‘three.js’ through NPM to be able to see the 3D preview locally.
npm i
~~~

**Note:** Pull requests and issue reports are very welcome!

license — zero‐clause BSD (0BSD)
---

Copyright © 2019–2020 by Pedro M. Zamboni “Zambonifofex”

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED “AS IS” AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
