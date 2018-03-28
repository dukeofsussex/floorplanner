import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

// Import all the things
import 'popper.js';
import 'bootstrap';
import 'codemirror';
import 'codemirror/mode/xml/xml.js';
import 'summernote/dist/summernote-bs4.js';

import { Floor } from './object';
import Polygon from './polygon';
import Storage from './storage';

const DOM_ELEMENT_ID_NAMES = [
    'EDIT_AREA',
    'EDIT_AREA_NAME',
    'EDIT_AREA_DESC',
    'EDIT_AREA_HOVER_DESC',
    'EDIT_FLOOR_NAME',
    'EDIT_FLOOR_DESC',
    'SHOW_AREA',
    'SHOW_AREA_NAME',
    'SHOW_AREA_DESC',
    'SHOW_FLOOR_NAME',
    'SHOW_FLOOR_DESC',
    'FLOOR_IMAGE',
    'FLOOR_IMAGE_URL',
    'FLOOR_LOADER',
    'FILE_IMPORT',
    'DELETE_AREA',
    'DELETE_FLOOR',
    'IMPORT',
    'EXPORT',
    'INTERFACE'
];

export default class FloorPlanner {
    constructor() {
        this.polygon = new Polygon('#floorplan > svg', (area) => this.handleAreaSelection(area));
        this.storage = new Storage();

        this.areaSelected = false;
        this.domElements = {};
        this.editing = false;
        this.selectedArea = { uid: '' };
        this.selectedFloorIndex = 0;

        this.initListeners();

    }

    init() {
        this.floor = this.storage.getFloor(this.selectedFloorIndex);
        console.log(this.floor);
        this.toggleDisabled(this.floor === null);
        if (this.floor !== null) {
            this.domElements.FLOOR_IMAGE.attr('src', this.floor.image);
            this.updateFloorFields();
            this.polygon.drawAreas(this.floor.areas, this.editing);
        }
    }

    addFloor() {
        this.deselectAllPolys();

        this.selectedFloorIndex = this.storage.addFloor(new Floor({ image: this.domElements.FLOOR_IMAGE_URL.val() }));
        this.init();

        // Delay clearing the input field until the modal has closed
        setTimeout(() => this.domElements.FLOOR_IMAGE_URL.val(''), 250);
    }

    deselectAllPolys() { // Added by Rob

        if (this.floor !== null) {
            this.handleAreaSelection(this.selectedArea);

            if (this.editing) {
                this.toggleEditMode();
            }
            this.polygon.selectedAreaIndex = -1;
            this.polygon.editing = false;

            this.updateAreaFields(this.selectedArea);
            this.updateFloorFields();
            this.polygon.drawAreas(this.floor.areas, this.editing);
        }
    }

    handleExport() {
        if (this.domElements.EXPORT.hasClass('disabled')) {
            return false;
        }

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.storage.export()));
        element.setAttribute('download', 'floorplan.json');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    handleImport() {
        this.deselectAllPolys();

        const files = this.domElements.FILE_IMPORT[0].files;

        if (!files.length > 0) {
            return;
        }

        const file = files[0];
        const fileReader = new FileReader();
        fileReader.onload = () => {
            this.storage.import(fileReader.result);
            this.init();
        }
        fileReader.readAsText(file);
    }

    handleAreaDelete() {
        const index = this.floor.areas.findIndex((a) => a.uid === this.selectedArea.uid);
        this.floor.areas.splice(index, 1);
        this.domElements.EDIT_AREA.toggle(false);
        this.selectedArea = { uid: '' };
        this.polygon.drawAreas(this.floor.areas, this.editing);
    }

    handleAreaSelection(area) {
        this.domElements.EDIT_AREA.toggle(this.editing && this.selectedArea.uid !== area.uid);
        this.domElements.SHOW_AREA.toggle(!this.editing && this.selectedArea.uid !== area.uid);
        this.selectedArea = this.selectedArea.uid === area.uid ? { uid: '' } : area;
        this.updateAreaFields(this.selectedArea);
    }

    handleFloorDelete() {
        this.deselectAllPolys();
        this.storage.deleteFloor(this.selectedFloorIndex);
        this.selectedFloorIndex = 0;
        this.init();
    }

    toggleDisabled(disabled) {
        this.domElements.EXPORT.toggleClass('disabled', disabled);
        this.domElements.INTERFACE.toggle(!disabled);
    }

    toggleEditMode() {
        this.editing = !this.editing;
        $('.edit').each((i, elem) => $(elem).toggle(this.editing));
        $('.show').each((i, elem) => $(elem).toggle(!this.editing));
        this.domElements.EDIT_AREA.toggle(this.editing && this.selectedArea.uid.length > 0);
        this.domElements.SHOW_AREA.toggle(!this.editing && this.selectedArea.uid.length > 0);
        this.updateAreaFields(this.selectedArea);
        this.updateFloorFields();

        if(this.floor === null)
        return;
        
        this.polygon.drawAreas(this.floor.areas, this.editing);
        this.storage.updateFloor(this.floor, this.selectedFloorIndex);
    }

    updateAreaFields(area) {
        if (area.uid.length === 0) {
            return;
        }

        if (this.editing) {
            this.domElements.EDIT_AREA_NAME.val(area.name);
            this.domElements.EDIT_AREA_DESC.summernote('code', area.description);
            this.domElements.EDIT_AREA_HOVER_DESC.summernote('code', area.hoverDescription);
        } else {
            this.domElements.SHOW_AREA_NAME.html(area.name);
            this.domElements.SHOW_AREA_DESC.html(area.description);
        }
    }

    updateFloorFields() {

        if(this.floor === null)
        return;
        
        if (this.editing) {
            this.domElements.EDIT_FLOOR_NAME.val(this.floor.name);
            this.domElements.EDIT_FLOOR_DESC.summernote('code', this.floor.description);
        } else {
            this.domElements.SHOW_FLOOR_NAME.html(this.floor.name);
            this.domElements.SHOW_FLOOR_DESC.html(this.floor.description);
        }
    }

    loadDOMElements() {
        for (let i = 0; i < DOM_ELEMENT_ID_NAMES.length; i++) {
            const actualIdentifier = DOM_ELEMENT_ID_NAMES[i].toLowerCase().replace(/\_/g, '-');
            this.domElements[DOM_ELEMENT_ID_NAMES[i]] = $('#' + actualIdentifier);
        }
    }

    initListeners() {
        this.loadDOMElements();

        this.domElements.EDIT_AREA_NAME.blur(() => {
            const index = this.floor.areas.findIndex((a) => a.uid === this.selectedArea.uid);
            this.floor.areas[index].name = this.domElements.EDIT_AREA_NAME.val();
            this.storage.updateFloor(this.floor, this.selectedFloorIndex);
        })

        this.domElements.EDIT_AREA_DESC.summernote({
            height: 275,
            focus: false,
            callbacks: {
                onBlur: () => {
                    const index = this.floor.areas.findIndex((a) => a.uid === this.selectedArea.uid);
                    this.floor.areas[index].description = this.domElements.EDIT_AREA_DESC.summernote('code');
                    this.storage.updateFloor(this.floor, this.selectedFloorIndex);
                }
            }
        });

        this.domElements.EDIT_AREA_HOVER_DESC.summernote({
            height: 70,
            focus: false,
            toolbar: [['media', ['picture']]],
            callbacks: {
                onBlur: () => {
                    const index = this.floor.areas.findIndex((a) => a.uid === this.selectedArea.uid);
                    this.floor.areas[index].hoverDescription = this.domElements.EDIT_AREA_HOVER_DESC.summernote('code');
                    this.storage.updateFloor(this.floor, this.selectedFloorIndex);
                }
            }
        });

        this.domElements.EDIT_FLOOR_NAME.blur(() => {
            this.floor.name = this.domElements.EDIT_FLOOR_NAME.val();
            this.storage.updateFloor(this.floor, this.selectedFloorIndex);
        });

        this.domElements.EDIT_FLOOR_DESC.summernote({
            height: 250,
            focus: false,
            callbacks: {
                onBlur: () => {
                    this.floor.description = this.domElements.EDIT_FLOOR_DESC.summernote('code');
                    this.storage.updateFloor(this.floor, this.selectedFloorIndex);
                }
            }
        });

        this.domElements.FLOOR_LOADER.on('click', () => this.addFloor());

        this.domElements.IMPORT.on('click', () => this.domElements.FILE_IMPORT.click());

        this.domElements.FILE_IMPORT.change(() => this.handleImport());

        this.domElements.EXPORT.on('click', () => this.handleExport());

        this.domElements.DELETE_AREA.on('click', () => this.handleAreaDelete());

        this.domElements.DELETE_FLOOR.on('click', () => this.handleFloorDelete());

        $('.toggle-mode').on('click', () => this.toggleEditMode());
    }
}
