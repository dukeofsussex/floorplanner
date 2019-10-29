<template>
    <main role="main"
          class="col-md-9 ml-sm-auto col-lg-10">
        <div class="pt-3 pb-2 mb-3 border-bottom">
            <div class="d-flex justify-content-between mb-1">
                <input v-if="editing.floor"
                       v-model="floor.name"
                       type="text"
                       class="form-control"
                       placeholder="Floor title">
                <h4 v-else
                    class="h4"
                    v-text="floor.name" />
                <div class="mr-5">
                    <button class="btn btn-link mr-5"
                            @click="toggleEditing('floor')"
                            v-text="editingDetailsToggleDesc" />
                </div>
            </div>
            <textarea v-if="editing.floor"
                      v-model="floor.description"
                      class="form-control"
                      placeholder="Floor description"
                      rows="2" />
            <p v-else
               class="mb-0"
               v-text="floor.description" />
        </div>
        <div class="row">
            <div class="col-12 col-md-8">
                <div class="card">
                    <div v-if="floor.image"
                         class="card-img-top position-relative">
                        <img ref="image"
                             :src="floor.image"
                             class="w-100">
                        <TheViewCanvas v-if="viewBox"
                                       :a.sync="floor.areas"
                                       :a-uid.sync="selectedAreaUid"
                                       :editing="editing.floor"
                                       :view-box="viewBox" />
                    </div>
                    <div v-else
                         class="d-flex align-items-center justify-content-center bg-dark text-light card-img-top image-placeholder">
                        <h4 class="h4 card-title">
                            Add an image to start planning
                        </h4>
                    </div>
                    <div v-if="editing.image || !floor.image"
                         class="card-body">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">Link</span>
                            </div>
                            <input :value="imageUrl"
                                   class="form-control"
                                   placeholder="https://"
                                   @blur="setImage($event.target.value)">
                        </div>
                        <form ref="fileImportForm">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Upload</span>
                                </div>
                                <div class="custom-file">
                                    <input type="file"
                                           accept="image/*"
                                           class="custom-file-input"
                                           @change="uploadImage($event.target.files[0])">
                                    <label class="custom-file-label">Choose file...</label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="text-center w-100">
                    <button class="btn btn-outline-info btn-label"
                            title="Remove floor"
                            @click="toggleEditing('image')">
                        <FaIcon :icon="['fa', 'edit']" />Edit image
                    </button>
                </div>
            </div>
            <div class="col-12 col-md-4">
                <div v-if="editing.floor && selectedArea"
                     class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="h5">
                            Editing Area
                        </h5>
                        <button type="button"
                                class="btn btn-outline-danger"
                                @click="deleteArea">
                            <FaIcon :icon="['fas', 'trash-alt']" />
                            Remove area
                        </button>
                    </div>
                    <div class="card-body">
                        <input v-model="selectedArea.name"
                               type="text"
                               class="form-control mb-3"
                               placeholder="Area name">
                        <div class="form-group">
                            <label for="area-desc">Description:</label>
                            <Editor id="area-desc"
                                    v-model="selectedArea.description" />
                        </div>
                        <div class="form-group">
                            <label for="edit-area-hover-desc">Hover Description:</label>
                            <Editor id="area-desc"
                                    v-model="selectedArea.hoverDescription"
                                    minimal="true" />
                        </div>
                    </div>
                </div>
                <div v-else-if="selectedArea"
                     class="card">
                    <div class="card-header">
                        <h5 class="h5"
                            v-text="selectedArea.name" />
                    </div>
                    <div class="card-body"
                         v-html="selectedArea.description" />
                </div>
                <div v-else
                     class="card bg-light" />
            </div>
        </div>
    </main>
</template>

<script lang="ts">
    import {
        Component,
        PropSync,
        Vue,
        Watch,
    } from 'vue-property-decorator';
    import Editor from './Editor.vue';
    import TheViewCanvas from './TheViewCanvas.vue';
    import { Area, Floor } from '@/models';

    @Component({
        components: {
            Editor,
            TheViewCanvas,
        },
    })
    export default class TheView extends Vue {
        @PropSync('f', { default: () => {} }) floor!: Floor;

        editing = {
            floor: false,
            image: false,
        };

        selectedAreaUid = '';

        viewBox = '';

        get editingDetailsToggleDesc() {
            return this.editing.floor ? 'Save' : 'Edit';
        }

        get imageUrl() {
            return this.floor.image.indexOf('://') !== -1 ? this.floor.image : '';
        }

        get selectedArea() {
            return this.floor.areas.find(a => a.uid === this.selectedAreaUid);
        }

        deleteArea() {
            const index = this.floor.areas.findIndex(a => a.uid === this.selectedAreaUid);

            this.floor.areas.splice(index, 1);
            this.selectedAreaUid = '';
        }

        setImage(url: string) {
            if (url.indexOf('://') === -1) {
                return;
            }

            this.floor.image = url;
            this.editing.floor = true;
            this.editing.image = false;
        }

        @Watch('floor.image', { immediate: true })
        setCanvasViewBox() {
            if (!this.floor.image) {
                return;
            }

            const img = new Image();

            img.onload = () => {
                const { naturalHeight, naturalWidth } = img;

                this.viewBox = `0 0 ${naturalWidth} ${naturalHeight}`;
            };

            this.viewBox = '';

            img.src = this.floor.image;
        }

        toggleEditing(prop: 'floor' | 'image') {
            this.editing[prop] = !this.editing[prop];
        }

        uploadImage(file: File) {
            if (!file) {
                return;
            }

            const fileReader = new FileReader();
            fileReader.onload = () => {
                if (!fileReader.result || typeof fileReader.result !== 'string') {
                    return;
                }

                this.floor.image = fileReader.result;
                this.editing.floor = true;
                this.editing.image = false;
                (this.$refs.fileImportForm as HTMLFormElement).reset();
            };
            fileReader.readAsDataURL(file);
        }
    }
</script>

<style lang="scss" scoped>
    textarea {
        resize: none;
    }

    .btn-label {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .card:last-of-type {
        height: 75vh;
    }

    .card-img-top {
        overflow-y: auto;
        max-height: 75vh;
    }

    @media (max-width: 767px) {
        .card-img-top {
            max-height: inherit;
        }
    }

    .image-placeholder {
        height: 250px;
    }
</style>
