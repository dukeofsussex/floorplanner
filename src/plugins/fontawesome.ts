import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faBars,
    faDownload,
    faEdit,
    faFile,
    faInfoCircle,
    faPlusCircle,
    faTimesCircle,
    faTrashAlt,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
    faBars,
    faDownload,
    faEdit,
    faFile,
    faInfoCircle,
    faPlusCircle,
    faTimesCircle,
    faTrashAlt,
    faUpload,
);

Vue.component('FaIcon', FontAwesomeIcon);
