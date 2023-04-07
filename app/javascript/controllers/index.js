// This file is auto-generated by ./bin/rails stimulus:manifest:update
// Run that command whenever you add a new controller or create them with
// ./bin/rails generate stimulus controllerName

import {application} from "./application.js"
import HelloController from "./hello-controller.js"
import SearchFormController from "./search_form-controller.js"
import AdminController from "./admin-controller.js"
import PaginationController from "./pagination_controller.js";
import ModalController from "./modal_controller.js";
import ToastController from "./toast_controller.js";

application.register("hello", HelloController)
application.register("search-form", SearchFormController)
application.register("admin", AdminController)
application.register("pagination", PaginationController)
application.register("modal", ModalController)
application.register("toast", ToastController)