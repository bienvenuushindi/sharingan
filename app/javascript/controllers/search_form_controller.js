import  Rails from "@rails/ujs";
import { Controller } from "@hotwired/stimulus"
import { useDebounce } from 'stimulus-use'
// Connects to data-controller="search-form"
export default class extends Controller {

  static debounces = ['search']

  connect() {
    useDebounce(this, { wait: 500 })
  }

  search(event) {
    // this.element.requestSubmit()
    Rails.fire(this.element, 'submit');
    console.log('test')
    event.preventDefault()
  }
}