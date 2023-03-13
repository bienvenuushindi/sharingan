import {Controller} from "@hotwired/stimulus"
import Pager from "../lib/PagerJs";

// Connects to data-controller="pagination"
export default class extends Controller {
    pager = null
    containerSelector = null

    connect() {
        this.containerSelector = '.table-entity'
        this.pager = [...document.querySelectorAll(this.containerSelector)].map(item => new Pager('pager' + item.getAttribute('data-table-id'), 4, 'pageNavPosition'));
    }

    source(event) {
        return event.target.closest('.table-parent-box').querySelector(this.containerSelector).getAttribute('data-table-id');
    }

    next(ev) {
        this.pager[this.source(ev)].next()
    }

    prev(ev) {
        this.pager[this.source(ev)].prev()
    }

    showPage(ev) {
        const pagerNumber = ev.target.getAttribute('data-page-number')
        this.pager[this.source(ev)].showPage(pagerNumber)
    }


}
