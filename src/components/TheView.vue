<template>
    <main role="main"
          class="col-md-9 ml-sm-auto col-lg-10">
        <div class="pt-3 pb-2 mb-3 border-bottom">
            <div class="d-flex justify-content-between mb-1">
                <input v-if="editing.details"
                       v-model="floor.name"
                       type="text"
                       class="form-control"
                       placeholder="Floor title">
                <h4 v-else
                    class="h4"
                    v-text="floor.name" />
                <button class="btn btn-link"
                        @click="toggleEditing('details')"
                        v-text="editingDetailsToggleDesc" />
            </div>
            <textarea v-if="editing.details"
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
                                       editing="true"
                                       :view-box="viewBox"
                                       @select="selectArea" />
                    </div>
                    <div v-else
                         class="d-flex align-items-center justify-content-center bg-dark text-light card-img-top image-placeholder">
                        <h4 class="h4 card-title">
                            Add an image to start planning
                        </h4>
                    </div>
                    <div v-if="editing.image"
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
                {{ floor.areas }}
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
    import TheViewCanvas from './TheViewCanvas.vue';
    // import TheViewEditor from './TheViewEditor.vue';
    import { Floor } from '@/models';

    @Component({
        components: {
            TheViewCanvas,
            // TheViewEditor,
        },
    })
    export default class TheView extends Vue {
        @PropSync('f', { default: () => {} }) floor!: Floor;

        editing = {
            details: false,
            image: true,
        };

        viewBox = '';

        get editingDetailsToggleDesc() {
            return this.editing.details ? 'Save' : 'Edit';
        }

        get imageUrl() {
            return this.floor.image.indexOf('://') !== -1 ? this.floor.image : '';
        }

        selectArea() {
            console.log(this.floor);
        }

        setImage(url: string) {
            if (url.indexOf('://') === -1) {
                return;
            }

            this.floor.image = url;
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

        toggleEditing(prop: 'details' | 'image') {
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
                this.editing.image = false;
                this.$refs.fileImportForm.reset();
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

    .image-placeholder {
        height: 250px;
    }
</style>
