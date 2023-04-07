import {Controller} from "@hotwired/stimulus"

// Connects to data-controller="modal"
export default class extends Controller {
    static targets = ['modal']

    show(ev) {
        document.getElementById(ev.target.getAttribute('data-target')).classList.remove('hidden');
    }

    hide(ev) {
        document.getElementById(ev.target.getAttribute('data-target')).classList.add('hidden');
    }
}
