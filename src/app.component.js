import draggable from 'vuedraggable';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { Floor, Floorplan } from './models';
import Storage from './storage';
import FloorGraph from './components/floor-graph/floor-graph.component.vue';
import Summernote from './components/summernote/summernote.component.vue';

export default {
    name: 'App',
    components: {
        draggable,
        FontAwesomeIcon,
        FloorGraph,
        Summernote,
    },
    computed: {
        canGoDownALevel: function () {
            return this.selectedFloorIndex !== 0;
        },
        canGoUpALevel: function () {
            return this.selectedFloorIndex < (this.floorplan.floors.length - 1);
        },
        floor: function () {
            return this.floorplan.floors[this.selectedFloorIndex];
        },
    },
    data: function () {
        return {
            areaSelected: false,
            floorplan: new Floorplan(),
            storage: new Storage(),
            editing: false,
            selectedArea: { uid: '' },
            selectedAreaIndex: -1,
            selectedFloorIndex: 0,
            showImageInputField: false,
        }
    },
    mounted: function () {
        this.floorplan = this.storage.getFloorplan() || new Floorplan();
    },
    methods: {
        addFloor: function () {
            this.resetSelectedArea();

            this.floorplan.floors.push(new Floor({ name: 'New Floor' }));
            this.storage.updateFloorplan(this.floorplan);

            this.selectFloor(this.floorplan.floors.length - 1)
        },
        changeFloorOrder: function (evt) {
            if (!evt.moved) {
                return;
            }

            if (evt.moved.oldIndex === this.selectedFloorIndex) {
                this.selectedFloorIndex = evt.moved.newIndex;
            } else if (evt.moved.oldIndex < this.selectedFloorIndex && evt.moved.newIndex >= this.selectedFloorIndex) {
                this.selectedFloorIndex -= 1;
            } else if (evt.moved.oldIndex > this.selectedFloorIndex && evt.moved.newIndex <= this.selectedFloorIndex) {
                this.selectedFloorIndex += 1;
            }

            this.storage.updateFloorplan(this.floorplan);
        },
        deleteArea: function () {
            this.floorplan.floors[this.selectedFloorIndex].areas.splice(this.selectedAreaIndex, 1);
            this.resetSelectedArea();
        },
        deleteFloor: function (index) {
            this.floorplan.floors.splice(index, 1);
            this.storage.updateFloorplan(this.floorplan);

            let newFloorIndex = this.selectedFloorIndex;

            if (index <= this.selectedFloorIndex) {
                newFloorIndex = (this.selectedFloorIndex > 0 ? this.selectedFloorIndex - 1 : 0);
            }

            this.selectFloor(newFloorIndex);
        },
        download: function () {
            if (!this.floor) {
                return;
            }

            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.storage.export()));

            let exportName = 'floorplan';

            if (this.floorplan.name !== '') {
                exportName = this.floorplan.name;
            }

            element.setAttribute('download', exportName + '.json');

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        },
        newFloorplan: function () {
            this.storage.deleteFloorplan();
            this.floorplan = new Floorplan();
            this.storage.addFloorplan(this.floorplan);
        },
        selectArea: function (area) {
            if (this.selectedArea.uid === area.uid) {
                this.resetSelectedArea();
            } else {
                this.selectedArea = this.selectedArea.uid === area.uid ? { uid: '' } : area;
                this.areaSelected = this.selectedArea.uid !== '';
                this.selectedAreaIndex = this.floorplan.floors[this.selectedFloorIndex].areas.findIndex((a) => a.uid === this.selectedArea.uid);
            }
        },
        selectFloor: function (index) {
            if (index === this.selectedFloorIndex || index < 0 || index >= this.floorplan.floors.length) {
                return;
            }

            this.selectedFloorIndex = index;
        },
        toggleEditMode: function () {
            this.editing = !this.editing;

            if (!this.editing) {
                this.storage.updateFloorplan(this.floorplan);
            }
        },
        toggleImageInputField: function () {
            this.showImageInputField = !this.showImageInputField;
        },
        upload: function ($event) {
            console.log($event);
            if (!event.target.files.length > 0) {
                return;
            }

            this.resetSelectedArea();

            const file = event.target.files[0];
            const fileReader = new FileReader();
            fileReader.onload = () => {
                this.storage.import(fileReader.result);
                this.floorplan = this.storage.getFloorplan();
                this.$refs.fileImportForm.reset();
            }
            fileReader.readAsText(file);
        },
        resetSelectedArea: function () {
            this.selectedArea = { uid: '' };
            this.selectedAreaIndex = -1;
            this.areaSelected = false;
        },
        onBlur: function (type, value) {
            switch (type) {
                case 'floorDesc':
                    this.floorplan.floors[this.selectedFloorIndex].description = value;
                    break;
                case 'areaName':
                    this.floorplan.floors[this.selectedFloorIndex].areas[this.selectedAreaIndex].name = value;
                    break;
                case 'areaDesc':
                    this.floorplan.floors[this.selectedFloorIndex].areas[this.selectedAreaIndex].description = value;
                    break;
                case 'areaHoverDesc':
                    this.floorplan.floors[this.selectedFloorIndex].areas[this.selectedAreaIndex].hoverDescription = value;
                    break;
                default: // floorName, floorImage and floorplan settings
                    break;
            }

            this.storage.updateFloorplan(this.floorplan);
        },
    }
};
