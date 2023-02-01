import {Controller} from "@hotwired/stimulus"
import {post} from "@rails/request.js";

export default class extends Controller {

    static targets = ['category'];

    connect() {
        this.token = document.querySelector(
            'meta[name="csrf-token"]'
        ).content;
    }

    async switch(event) {
        let targetCategory = this.categoryTarget.value
        const params = {category: event.target.value};
        await post("/group-by", {
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