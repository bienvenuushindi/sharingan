# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from "app/javascript/lib", under: "lib"
pin "stimulus-use", to: "https://ga.jspm.io/npm:stimulus-use@0.51.3/dist/index.js", preload: true
pin "hotkeys-js", to: "https://ga.jspm.io/npm:hotkeys-js@3.10.1/dist/hotkeys.esm.js", preload: true
pin "@rails/ujs", to: "https://ga.jspm.io/npm:@rails/ujs@7.0.4-1/lib/assets/compiled/rails-ujs.js"
pin "@rails/request.js", to: "https://ga.jspm.io/npm:@rails/request.js@0.0.8/src/index.js"
pin "marked", to: "https://ga.jspm.io/npm:marked@4.2.12/lib/marked.cjs"
pin "easymde", to: "https://ga.jspm.io/npm:easymde@2.18.0/src/js/easymde.js"
pin "codemirror", to: "https://ga.jspm.io/npm:codemirror@5.65.12/lib/codemirror.js"
pin "codemirror-spell-checker", to: "https://ga.jspm.io/npm:codemirror-spell-checker@1.1.2/src/js/spell-checker.js"
pin "codemirror/", to: "https://ga.jspm.io/npm:codemirror@5.65.12/"
pin "fs", to: "https://ga.jspm.io/npm:@jspm/core@2.0.1/nodelibs/browser/fs.js"
pin "typo-js", to: "https://ga.jspm.io/npm:typo-js@1.2.2/typo.js"
