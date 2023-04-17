// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails\
import "@hotwired/turbo-rails"
import "@rails/ujs"
import "hotkeys-js"
import "@rails/request.js"
import "./controllers/index.js"
import "easymde"
import "./lib/PagerJs.js"


Turbo.setConfirmMethod((message, element) => {
    let confirmText = element.dataset.turboConfirmText
    let description = element.dataset.turboConfirmDescription || ""
    let dialog = document.getElementById('#turbo-confirm')
    let confirmField = dialog.querySelector("[data-behavior='confirm-text']")
    let commitButton = dialog.querySelector("button[value='confirm']")
    dialog.querySelector("[data-behavior='title']").textContent = message
    dialog.querySelector("[data-behavior='description']").innerHTML = description
    confirmField.value = '';
    if (confirmText) {
        confirmField.style.display = ''
        commitButton.disabled = true
        confirmField.addEventListener("input", (ev) => {
            commitButton.disabled = (ev.target.value !== confirmText)
        })
    } else {
        confirmField.style.display = 'none'
    }

    dialog.showModal()
    return new Promise((resolve, reject) => {
        dialog.addEventListener("close", () => {
            resolve(dialog.returnValue === "confirm")
        }, {once: true})
    })
})