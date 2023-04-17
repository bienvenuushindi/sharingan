import {Controller} from "@hotwired/stimulus"

// Connects to data-controller="toast"
export default class extends Controller {
    connect() {
        this.fadeOutEffect(this.element)

    }

    fadeOutEffect(element) {
        let fadeEffect = setInterval(function () {
            if (!element.style.opacity) {
                element.style.opacity = 1;
            }
            if (element.style.opacity > 0) {
                element.style.opacity -= 0.1;
            } else {
                clearInterval(fadeEffect);
            }
        }, 2000);
    }
}
