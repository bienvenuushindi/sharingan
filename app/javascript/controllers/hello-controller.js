import {Controller} from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
    }

    toggleAccordion(event) {
        const target = event.target
        const isExpanded = $(target).attr('aria-expanded')
        const controlsTarget = $(target).attr('aria-controls')
        const targetContainer = $('#'+controlsTarget)
        if (isExpanded === 'true') {
            $(target).attr('aria-expanded', false)
        } else {
            $(target).attr('aria-expanded', true)
        }
        $(target).find('span').toggleClass('rotate-180')
        targetContainer.toggleClass('hidden')
    }

    sideMenu = $('#side-menu');
    mainSection = $('#main');

    openMenu() {
        this.sideMenu.removeClass('left-[-250px]');
        this.sideMenu.addClass('left-0');
        this.mainSection.addClass('xl:ml-64');
    }

    closeMenu() {
        this.sideMenu.removeClass('left-0');
        this.sideMenu.addClass('left-[-250px]');
        this.mainSection.removeClass('xl:ml-64');
    }
}
