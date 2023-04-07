import Rails from "@rails/ujs";
import {Controller} from "@hotwired/stimulus"
import {useDebounce} from 'stimulus-use'


export default class extends Controller {

    static debounces = ['search', 'filterProject']

    connect() {
        useDebounce(this, {wait: 500})
    }


    showBox() {
        $('#projects-list').removeClass('hidden')
        $('#cross-btn').removeClass('hidden')
    }

    hideBox() {
        $('#projects-list').addClass('hidden')
        $('#cross-btn').addClass('hidden')
    }

    search(event) {
        Rails.fire(this.element, 'submit');
        event.preventDefault()
    }

    filterProject(event) {
        const projects = document.getElementsByClassName('projects');
        const element = event.target;
        [].forEach.call(projects, (item) => {
            if (!item.textContent.toLowerCase().includes(element.value.toLowerCase())) item.closest('.wrapper').classList.add('hidden');
            else item.closest('.wrapper').removeClass('hidden');
        })
    }
}