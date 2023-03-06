import {Controller} from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        // this.element.textContent = "Hello World!"
        // closeMenu()

    }

    toggleAccordion(event) {
        const target = event.target
        const isExpanded = target.getAttribute('aria-expanded')
        const controlsTarget = target.getAttribute('aria-controls')
        const targetContainer = document.getElementById(controlsTarget)
        if (isExpanded === 'true') {
            target.setAttribute('aria-expanded', false)
            targetContainer.classList.add('hidden')
        } else {
            targetContainer.classList.remove('hidden')
            target.setAttribute('aria-expanded', true)
        }
    }

    sideMenu = document.getElementById('side-menu');
    mainSection = document.getElementById('main');

    openMenu() {
        this.sideMenu.classList.remove('left-[-250px]');
        this.sideMenu.classList.add('left-0');
        this.mainSection.classList.add('xl:ml-64');
    }

    closeMenu() {
        this.sideMenu.classList.remove('left-0');
        this.sideMenu.classList.add('left-[-250px]');
        this.mainSection.classList.remove('xl:ml-64');
    }
}
