import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

// Import all the things
import 'bootstrap/dist/css/bootstrap.css';
import 'summernote/dist/summernote-bs4.css';
import 'codemirror/lib/codemirror.css';
import 'popper.js';
import 'bootstrap';
import 'codemirror';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/xml/xml.js';
import 'summernote/dist/summernote-bs4.js';

export default class FloorPlanner {
    constructor() {
        $('#summernoteAreaDesc').summernote({
            height: 150,                 // set editor height
            minHeight: null,             // set minimum height of editor
            maxHeight: null,             // set maximum height of editor
            focus: false                  // set focus to editable area after initializing summernote
        });

        $('#summernoteAreaHoverDesc').summernote({
            height: 70,                 // set editor height
            minHeight: null,             // set minimum height of editor
            maxHeight: null,             // set maximum height of editor
            focus: false,                  // set focus to editable area after initializing summernote
            toolbar: [['media', ['picture', 'link', 'video']]]
        });

        $('#summernoteFloorDesc').summernote({
            height: 250,                 // set editor height
            minHeight: null,             // set minimum height of editor
            maxHeight: null,             // set maximum height of editor
            focus: false                  // set focus to editable area after initializing summernote
        });
    }

    loadFloorPlan(url) {
        $('#floorplan').attr('src', url);
    }
}
