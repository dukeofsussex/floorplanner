import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faBars,
    faChevronDown,
    faChevronUp,
    faCogs,
    faDownload,
    faEdit,
    faFile,
    faImage,
    faInfoCircle,
    faPlayCircle,
    faPlus,
    faPlusCircle,
    faSave,
    faTimesCircle,
    faToggleOff,
    faToggleOn,
    faTrashAlt,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
    faBars,
    faChevronDown,
    faChevronUp,
    faCogs,
    faDownload,
    faEdit,
    faFile,
    faImage,
    faInfoCircle,
    faPlayCircle,
    faPlus,
    faPlusCircle,
    faSave,
    faTimesCircle,
    faToggleOff,
    faToggleOn,
    faTrashAlt,
    faUpload,
);

Vue.component('FaIcon', FontAwesomeIcon);
