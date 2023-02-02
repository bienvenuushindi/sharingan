import {Controller} from "@hotwired/stimulus"
import {post} from "@rails/request.js";

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
            item.checked = false
        })
    }


    get isOriginReviews() {
        return this.target === 'reviews'
    }

    get target() {
        return this.categoryTarget.getAttribute('data-origin')
    }

    get url() {
        return this.isOriginReviews ? "/checklist" : "/group-by"
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