<template>
    <nav class="col-md-2 d-none d-md-block sidebar">
        <div class="sidebar-sticky">
            <ul class="nav flex-column">
                <li class="nav-item">
                    <button class="btn btn-link nav-link"
                            href="#">
                        <FaIcon :icon="['fa', 'file']" />
                        New
                    </button>
                </li>
                <li class="nav-item">
                    <button class="btn btn-link nav-link"
                            @click="$refs.fileImport.click()">
                        <FaIcon :icon="['fa', 'upload']" />
                        Import
                    </button>
                </li>
                <form ref="fileImportForm">
                    <input id="file-import"
                           ref="fileImport"
                           type="file"
                           accept=".json"
                           @change="upload($event.target.files[0])">
                </form>
                <li class="nav-item">
                    <button class="btn btn-link nav-link"
                            @click="download">
                        <FaIcon :icon="['fa', 'download']" />
                        Export
                    </button>
                </li>
            </ul>
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                <span>Floors</span>
                <button class="btn btn-link btn-sm text-muted"
                        @click="addFloor">
                    <FaIcon :icon="['fa', 'plus-circle']" />
                </button>
            </h6>
            <draggable :list="floorplan.floors"
                       class="nav nav-pills flex-column mb-2"
                       handle=".handle"
                       tag="ul"
                       @change="changeOrder">
                <li v-for="(floor, index) in floorplan.floors"
                    :key="floor.uid"
                    class="d-flex nav-item">
                    <button :class="['btn', 'btn-link', 'btn-block', 'nav-link', 'text-left', { 'active': floor.active }]"
                            @click="selectFloor(index)">
                        <FaIcon :icon="['fa', 'bars']"
                                class="handle mr-2" />
                        {{ floor.name }}
                    </button>
                    <button v-if="!floor.active"
                            class="btn btn-sm btn-link nav-link"
                            @click="removeFloor(index)">
                        <FaIcon :icon="['fa', 'times-circle']"
                                class="handle mr-2" />
                    </button>
                </li>
            </draggable>
        </div>
    </nav>
</template>

<script lang="ts">
    import {
        Component,
        Prop,
        PropSync,
        Vue,
    } from 'vue-property-decorator';
    import draggable from 'vuedraggable';
    import { Floorplan } from '@/models';
    import { generateUID } from '@/util';

    @Component({
        components: {
            draggable,
        },
    })
    export default class TheSidebar extends Vue {
        @Prop({ default: false }) readonly small!: boolean;

        @PropSync('fp', { default: () => { } }) floorplan!: Floorplan;

        addFloor() {
            this.floorplan.floors.push({
                active: true,
                areas: [],
                description: '',
                image: '',
                name: `Floor ${this.floorplan.floors.length + 1}`,
                uid: generateUID(),
            });

            return this.floorplan;
        }

        changeOrder() {
            return this.floorplan;
        }

        download() {
            const element = document.createElement('a');
            element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(this.floorplan, null, 1))}`);

            element.setAttribute('download', `${this.floorplan.name}.json`);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        removeFloor(index: number) {
            this.floorplan.floors.splice(index, 1);
        }

        selectFloor(index: number) {
            const activeIndex = this.floorplan.floors.findIndex(f => f.active);

            if (activeIndex !== -1) {
                this.floorplan.floors[activeIndex].active = false;
            }

            this.floorplan.floors[index].active = true;
        }

        upload(file: File) {
            console.log(file);
            if (!file) {
                return;
            }

            const fileReader = new FileReader();
            fileReader.onload = () => {
                if (!fileReader.result || typeof fileReader.result !== 'string') {
                    return;
                }

                this.floorplan = JSON.parse(fileReader.result);
                this.$refs.fileImportForm.reset();
            };
            fileReader.readAsText(file);
        }
    }
</script>

<style lang="scss" scoped>

    #file-import {
        display: none;
    }

    .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 100; /* Behind the navbar */
        padding: 48px 0 0; /* Height of navbar */
        box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);

        .sidebar-sticky {
            position: relative;
            top: 0;
            height: calc(100vh - 48px);
            padding-top: .5rem;
            overflow-x: hidden;
            overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
        }

        @supports ((position: -webkit-sticky) or (position: sticky)) {
            .sidebar-sticky {
                position: -webkit-sticky;
                position: sticky;
            }
        }

        .nav-link {
            color: #333;
            border-bottom-left-radius: 0;
            border-top-left-radius: 0;
            font-weight: 500;
        }

        .sidebar-heading {
            font-size: .75rem;
            text-transform: uppercase;
        }
    }
</style>
