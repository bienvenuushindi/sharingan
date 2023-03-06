import {Controller} from "@hotwired/stimulus"
import {post, get} from "@rails/request.js";
import EasyMDE from "easymde";

export default class extends Controller {

    static targets = ['category'];

    easyMDE;

    selectedProject = null

    connect() {
        this.token = document.querySelector(
            'meta[name="csrf-token"]'
        ).content;

        this.resetFields()
    }

    resetFields() {
        this.categoryTargets.forEach(item => {
            if (!this.isOriginChecklist) item.checked = false;
        })
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
        return this.categoryTarget.getAttribute('data-origin')
    }

    get url() {
        return this.categoryTarget.getAttribute('data-url')
    }

    async checklist() {
        if (this.categoryTarget.checked) {
            const currentItem = this.getElementById('rc-' + this.categoryTarget.value);
            if (currentItem) currentItem.remove()
        } else {
            await this.fetchBody()
        }
    }

    copyText(event) {
        // Get the source
        const target = event.target
        const parent = target.closest('div')
        const copyText = parent.firstElementChild;
        // Copy the text
        navigator.clipboard.writeText(copyText.innerHTML);
        parent.lastElementChild.classList.remove('hidden');
        setTimeout(() => {
            parent.lastElementChild.classList.add('hidden')
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
                return Turbo.renderStreamMessage(html)
            });
    }

    getElementById(element) {
        return document.getElementById(element)
    }

    async switch(event) {
        let url = event.target.getAttribute('data-url') || this.url
        const cat = event.target.getAttribute('data-value') || event.target.value
        if (this.isOriginReviews) {
            // this.getElementById('review').innerHTML = '';
            this.getElementById('filter-project').value = this.getElementById('project-' + cat).textContent
            this.getElementById('project-title').innerHTML = this.getElementById('project-' + cat).textContent
            this.getElementById('projects-list').classList.add('hidden')
            this.getElementById('cross-btn').classList.add('hidden')
            if(this.selectedProject !== cat ){
                this.getElementById('review').innerHTML = ''
                console.log('state changed')
                this.selectedProject = cat;
            }

        }

        if (this.isOriginCategories) {
            this.getElementById('add-article').classList.remove('hidden')
            if(!this.easyMDE){
                const textArea = this.getElementById('markdown')
                this.easyMDE = textArea && new EasyMDE({element: textArea, placeholder: "Type here...", showIcons: ["code", "table"], insertTexts: {
                        horizontalRule: ["", "\n\n-----\n\n"],
                        image: ["![](http://", ")"],
                        link: ["[", "](https://)"],
                        table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
                    },});
            }

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