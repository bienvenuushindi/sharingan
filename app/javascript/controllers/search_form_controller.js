import Rails from "@rails/ujs";
import {Controller} from "@hotwired/stimulus"
import {useDebounce} from 'stimulus-use'
// import {post} from "@rails/request.js";

export default class extends Controller {

    static debounces = ['search']

    connect() {
        useDebounce(this, {wait: 500})
    }

    search(event) {
        console.log(this.element)
        Rails.fire(this.element, 'submit');
        event.preventDefault()
    }
}