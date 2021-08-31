sked
===

This web application facilitates modifying body part scaling for Senran Kagura games such as Shinovi Versus and Estival Versus.

hacking
---

In order to try sked out locally, it suffices to run a simple HTTP server from the repository’s directory. Here’s an example of how you could do it with a POSIX shell:

~~~ Bash
# Step 1: Clone the repository to your computer.
git clone https://github.com/zamfofex/sked
cd sked

# Step 2: Start an HTTP server (Python’s in this example).
python3 -m http.server 3000

# Step 3: Open ‘http://localhost:3000’ in your browser.
~~~

**Note:** Pull requests and issue reports are very welcome!

license — zero‐clause BSD (0BSD)
---

Copyright © 2019–2021 by zamfofex

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED “AS IS” AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
