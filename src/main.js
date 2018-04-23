// Import all the things
import 'popper.js';
import 'bootstrap';
import 'codemirror';
import 'codemirror/mode/xml/xml';
import 'summernote/dist/summernote-bs4';
import jQuery from 'jquery';

// Have to import it here, as importing it in the stylesheet causes
// issues with the fonts paths not being resolved properly
import 'summernote/dist/summernote-bs4.css';

import Vue from 'vue';
import App from './app.component.vue';

window.$ = jQuery;
window.jQuery = jQuery;

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App),
});
