import {Controller} from "@hotwired/stimulus"
import {closeMenu} from "../custom";

export default class extends Controller {
    connect() {
        // this.element.textContent = "Hello World!"
        // closeMenu()
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
