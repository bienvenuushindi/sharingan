import Rails from "@rails/ujs";
import {Controller} from "@hotwired/stimulus"
import {useDebounce} from 'stimulus-use'
// import {post} from "@rails/request.js";

export default class extends Controller {

    static debounces = ['search', 'filterProject']

    connect() {
        useDebounce(this, {wait: 500})
    }

    getElementById(element) {
        return document.getElementById(element)
    }

    showBox() {
        this.getElementById('projects-list').classList.remove('hidden')
        this.getElementById('cross-btn').classList.remove('hidden')
    }

    hideBox(){
        this.getElementById('projects-list').classList.add('hidden')
        this.getElementById('cross-btn').classList.add('hidden')
    }

    search(event) {
        console.log(this.element)
        Rails.fire(this.element, 'submit');
        event.preventDefault()
    }

    filterProject(event) {
        const projects = document.getElementsByClassName('projects');
        const element = event.target;
        [].forEach.call(projects, (item) => {
            if (!item.textContent.toLowerCase().includes(element.value.toLowerCase())) item.closest('.wrapper').classList.add('hidden');
            else item.closest('.wrapper').classList.remove('hidden');
        })
    }
}