import {Controller} from "@hotwired/stimulus"
import {post, get} from "@rails/request.js";

export default class extends Controller {

    static targets = ['category'];

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

    get target() {
        return this.categoryTarget.getAttribute('data-origin')
    }

    get url() {
        return this.categoryTarget.getAttribute('data-url')
    }

    async checklist() {
        if (this.categoryTarget.checked) {
            const currentItem = document.getElementById('rc-' + this.categoryTarget.value);
            if (currentItem) currentItem.remove()
        } else {
            await this.fetchBody()
        }
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

    async switch(event) {
        const params = {category: event.target.value, origin: this.target};
        await post(this.url, {
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