# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin_all_from "app/javascript/controllers", under: "controllers"
pin "ethers", to: "https://ga.jspm.io/npm:ethers@6.0.1/lib.esm/index.js"
pin "#lib.esm/crypto/crypto.js", to: "https://ga.jspm.io/npm:@jspm/core@2.0.0/nodelibs/@empty.js"
pin "#lib.esm/providers/provider-ipcsocket.js", to: "https://ga.jspm.io/npm:@jspm/core@2.0.0/nodelibs/@empty.js"
pin "#lib.esm/providers/ws.js", to: "https://ga.jspm.io/npm:@jspm/core@2.0.0/nodelibs/@empty.js"
pin "#lib.esm/utils/base64.js", to: "https://ga.jspm.io/npm:@jspm/core@2.0.0/nodelibs/@empty.js"
pin "#lib.esm/utils/geturl.js", to: "https://ga.jspm.io/npm:@jspm/core@2.0.0/nodelibs/@empty.js"
pin "#lib.esm/wordlists/wordlists.js", to: "https://ga.jspm.io/npm:@jspm/core@2.0.0/nodelibs/@empty.js"
pin "@adraffy/ens-normalize/xnf", to: "https://ga.jspm.io/npm:@adraffy/ens-normalize@1.8.9/dist/index-xnf.js"
pin "@noble/hashes/crypto", to: "https://ga.jspm.io/npm:@noble/hashes@1.1.2/esm/cryptoBrowser.js"
pin "@noble/hashes/ripemd160", to: "https://ga.jspm.io/npm:@noble/hashes@1.1.2/esm/ripemd160.js"
pin "@noble/hashes/scrypt", to: "https://ga.jspm.io/npm:@noble/hashes@1.1.2/esm/scrypt.js"
pin "@noble/hashes/sha3", to: "https://ga.jspm.io/npm:@noble/hashes@1.1.2/esm/sha3.js"
pin "@noble/secp256k1", to: "https://ga.jspm.io/npm:@noble/secp256k1@1.7.1/lib/esm/index.js"
pin "aes-js", to: "https://ga.jspm.io/npm:aes-js@4.0.0-beta.3/lib.esm/index.js"
pin "crypto", to: "https://ga.jspm.io/npm:@jspm/core@2.0.0/nodelibs/browser/crypto.js"
