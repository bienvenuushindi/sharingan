import {Controller} from "@hotwired/stimulus"
import {post, get} from "@rails/request.js";
import EasyMDE from "easymde";

export default class extends Controller {

    static targets = ['category'];

    easyMDE;

    selectedProject = null

    connect() {
        this.token = $(
            'meta[name="csrf-token"]'
        ).attr('content');

        if (this.isOriginCategories) {
            if (!this.easyMDE) {
                const textArea = $('#markdown').get(0);
                this.easyMDE = textArea && new EasyMDE({
                    element: textArea, placeholder: "Type here...", showIcons: ["code", "table"], insertTexts: {
                        horizontalRule: ["", "\n\n-----\n\n"],
                        image: ["![](http://", ")"],
                        link: ["[", "](https://)"],
                        table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
                    },
                });
            }
        }

        if (!this.isOriginChecklist) this.resetFields()
    }

    resetFields() {
        $(this.categoryTargets).prop('checked', false)
    }

    get isOriginChecklist() {
        return (this.target === 'changes')
    }

    get isOriginReviews() {
        return this.target === 'reviews'
    }

    get isOriginCategories() {
        return this.target === 'categories'
    }

    get target() {
        return $(this.categoryTarget).attr('data-origin')
    }

    get url() {
        return $(this.categoryTarget).attr('data-url')
    }

    async checklist() {
        const container = $('#count-changes');
        if (this.categoryTarget.checked) {
            const currentItem = $('#rc-' + this.categoryTarget.value).get(0);
            if (currentItem) currentItem.remove()
            container.text(parseInt(container.text()) - 1)
        } else {
            await this.fetchBody()
            container.text(parseInt(container.text()) + 1)
        }
        $(this.categoryTarget).next().toggleClass('line-through')
    }

    copyText(event) {
        // Get the source
        const target = event.target
        const siblings = $(target.closest('div')).children()
        const lastElement = siblings.last()
        const copyText = siblings.first()
        // Copy the text
        navigator.clipboard.writeText(copyText.html());
        lastElement.removeClass('hidden');
        setTimeout(() => {
            lastElement.addClass('hidden')
        }, 1000)
    }


    async fetchBody() {
        await get(this.url, {
            'X-CSRF-Token': this.token,
            contentType: 'application/json',
            credentials: 'same-origin',
            responseKind: 'turbo-stream'
        }).then(response => response.text)
            .then(html => {
                const container = $('#count-changes');
                container.text(parseInt(container.text()) + 1)
            });
    }

    async switch(event) {
        const source = event.target
        let url = $(source).attr('data-url') || this.url
        const cat = $(source).attr('data-value') || source.value
        if (this.isOriginReviews) {
            const category = $('#project-' + cat).html()
            $('#filter-project').value = category
            $('#project-title').text(category)
            $('#projects-list').addClass('hidden')
            $('#cross-btn').addClass('hidden')
            if (this.selectedProject !== cat) {
                $('#review').html('')
                this.selectedProject = cat;
            }
        }
        if (this.isOriginCategories) {
            $('#add-article').removeClass('hidden')
        }

        const params = {category: cat, origin: this.target};
        await post(url, {
            body: params,
            'X-CSRF-Token': this.token,
            contentType: 'application/json',
            credentials: 'same-origin',
            responseKind: 'turbo-stream'
        }).then(response => response.text)
            .then(html => {
                return Turbo.renderStreamMessage(html)
            });
        event.preventDefault()
    }
}