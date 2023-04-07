import {Controller} from "@hotwired/stimulus"

// Connects to data-controller="toast"
export default class extends Controller {
    connect() {
        $(this.element).delay(2000).fadeOut()
    }
}
