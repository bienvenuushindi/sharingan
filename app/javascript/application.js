import "@hotwired/turbo-rails"
import "@rails/ujs"
// import "stimulus-use"
import "hotkeys-js"
import "@rails/request.js"
import "./controllers/index.js"
import "easymde"
import "./lib/PagerJs.js"


import jquery from 'jquery'

window.jQuery = jquery
window.$ = jquery
// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

Turbo.setConfirmMethod((message, element) => {
    let confirmText = element.dataset.turboConfirmText
    let description = element.dataset.turboConfirmDescription || ""
    let dialog = $('#turbo-confirm')
    let confirmField = dialog.find("[data-behavior='confirm-text']")
    let commitButton = dialog.find("button[value='confirm']")
    dialog.find("[data-behavior='title']").text(message)
    dialog.find("[data-behavior='description']").html(description)
    confirmField.prop('value', '')
    if (confirmText) {
        confirmField.show()
        commitButton.prop('disabled', true)
        confirmField.get(0).addEventListener("input", (ev) => {
            commitButton.prop('disabled', (ev.target.value !== confirmText))
        })
    } else {
        confirmField.hide()
    }

    dialog.get(0).showModal()
    return new Promise((resolve, reject) => {
        dialog.get(0).addEventListener("close", () => {
            resolve(dialog.get(0).returnValue === "confirm")
        }, {once: true})
    })
})