// Import all the things
import 'popper.js';
import 'bootstrap';
import 'codemirror';
import 'codemirror/mode/xml/xml';
import 'summernote/dist/summernote-bs4';
import jQuery from 'jquery';
import Vue from 'vue';

// Have to import it here, as importing it in the stylesheet causes
// issues with the fonts paths not being resolved properly
import 'summernote/dist/summernote-bs4.css';

// Used fontawesome icons
import fontawesome from '@fortawesome/fontawesome';
import {
    faBars,
    faChevronDown,
    faChevronUp,
    faCogs,
    faDownload,
    faEdit,
    faImage,
    faInfoCircle,
    faPlayCircle,
    faPlus,
    faPlusSquare,
    faSave,
    faToggleOff,
    faToggleOn,
    faTrashAlt,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';

import App from './app.component.vue';

window.$ = jQuery;
window.jQuery = jQuery;

fontawesome.library.add(
    faBars,
    faChevronDown,
    faChevronUp,
    faCogs,
    faDownload,
    faEdit,
    faImage,
    faInfoCircle,
    faPlayCircle,
    faPlus,
    faPlusSquare,
    faSave,
    faToggleOff,
    faToggleOn,
    faTrashAlt,
    faUpload);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App),
});
