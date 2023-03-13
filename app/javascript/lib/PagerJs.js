class Pager {
    currentPage = 1;
    pages = 0;
    inited = false;
    rows = null

    constructor(tableName, itemsPerPage, positionId) {
        this.tableElement = document.getElementById(tableName);
        this.itemsPerPage = itemsPerPage;
        this.position = this.tableElement.parentElement.querySelector('.' + positionId)
        this.init()
        this.showPageNav()
        this.showPage(1)
    }

    showRecords(from, to) {
        // i starts from 1 to skip table header row
        for (let i = 1; i < this.rows.length; i++) {
            if (i < from || i > to) {
                this.rows[i].classList.add('hidden');
            } else {
                this.rows[i].classList.remove('hidden');
            }
        }
    };

    showPage(pageNumber) {
        if (!this.inited || this.rows.length - 1 <= this.itemsPerPage) {
            return;
        }

        let oldPageAnchor = this.position.querySelector('[data-id="pg' + this.currentPage + '"]');
        oldPageAnchor.className = 'pg-normal';

        this.currentPage = pageNumber;
        let newPageAnchor = this.position.querySelector('[data-id="pg' + this.currentPage + '"]');
        newPageAnchor.className = 'pg-selected';

        let from = (pageNumber - 1) * this.itemsPerPage + 1;
        let to = from + this.itemsPerPage - 1;
        this.showRecords(from, to);

        let pgNext = this.position.querySelector('.pg-next'),
            pgPrev = this.position.querySelector('.pg-prev');

        if (this.currentPage === this.pages) {
            pgNext.classList.add('hidden')
        } else {
            pgNext.classList.remove('hidden')
        }

        if (this.currentPage === 1) {
            pgPrev.classList.add('hidden')
        } else {
            pgPrev.classList.remove('hidden')
        }
    };

    prev() {
        if (this.currentPage > 1) {
            this.showPage(this.currentPage - 1);
        }
    };

    next() {
        if (this.currentPage < this.pages) {
            this.showPage(this.currentPage + 1);
        }
    };


    init() {
        this.rows = this.tableElement.rows;
        let records = (this.rows.length - 1);

        this.pages = Math.ceil(records / this.itemsPerPage);
        this.inited = true;
    };

    showPageNav() {
        if (!this.inited || this.rows.length - 1 <= this.itemsPerPage) {
            return;
        }

        let pagerHtml = '<span data-action="click->pagination#prev" class="pg-normal pg-prev">«</span>';

        for (let page = 1; page <= this.pages; page++) {
            pagerHtml += '<span data-id="pg' + page + '" class="pg-normal" data-action="click->pagination#showPage" data-page-number="' + page + '">' + page + '</span>';
        }

        pagerHtml += '<span data-action="click->pagination#next"  class="pg-normal pg-next">»</span>';

        this.position.innerHTML = pagerHtml;
    };
}

export default Pager