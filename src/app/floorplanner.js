import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

// Import all the things
import 'popper.js';
import 'bootstrap';
import 'codemirror';
import 'codemirror/mode/xml/xml.js';
import 'summernote/dist/summernote-bs4.js';

import Polygon from './polygon';
import Storage from './storage';

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

        $('#floor-loader').on('click', () => {
            $('#floorplan > img').attr('src', $('#floor-url').val());

            // Delay clearing the input field until the modal has closed
            setTimeout(() => $('#floor-url').val(''), 250);
        });

        this.polygon = new Polygon('#floorplan > svg', this.handlePolygonSelection);
        this.storage = new Storage();
        this.selectedFloor = 0;
        this.editing = false;
    }

    init() {
        this.floorplans = this.storage.get();
        this.polygon.drawAreas(this.floorplans.floors[this.selectedFloor].areas, this.editing);
    }

    handlePolygonSelection(polygon) {
        console.log(polygon);
    }

    toggleEditMode() {
        $('.edit').each((i, elem) => elem.style.display = this.editing ? 'none' : 'block');
        $('.show').each((i, elem) => elem.style.display = this.editing ? 'block' : 'none');
        this.editing = !this.editing;
        this.polygon.drawAreas(this.floorplans.floors[this.selectedFloor].areas, this.editing);
    }
}
