<template>
    <div class="container-fluid bg-light">
        <nav class="navbar navbar-expand-sm fixed-top navbar-light bg-dark">
            <a class="navbar-brand text-white" href="#">Floorplanner</a>
            <ul class="navbar-nav mr-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle text-white" href="#" id="fileDropdown" role="button" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                        Floorplan
                    </a>
                    <div class="dropdown-menu" aria-labelledby="fileDropdown">
                        <button class="dropdown-item" v-on:click="newFloorplan()">
                            <font-awesome-icon v-bind:icon="['fas', 'plus-square']" />
                            New
                        </button>
                        <button class="dropdown-item" href="#" role="button" data-toggle="modal" data-target="#floorplanSettingsModal">
                            <font-awesome-icon v-bind:icon="['fas', 'cogs']" />
                            Settings
                        </button>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" v-on:click="$refs.fileImport.click()">
                            <font-awesome-icon v-bind:icon="['fas', 'upload']" />
                            Import
                        </button>
                        <form ref="fileImportForm">
                            <input id="file-import" type="file" accept=".json" v-on:change="upload($event)" ref="fileImport"/>
                        </form>
                        <button class="dropdown-item" v-bind:class="{ disabled: !floor }" v-on:click="download()">
                            <font-awesome-icon v-bind:icon="['fas', 'download']" />
                            Export
                        </button>
                    </div>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="#" role="button" data-toggle="modal" data-target="#floorsModal">
                        Manage Floors
                    </a>
                </li>
            </ul>
            <ul class="nav navbar-nav navbar-right" v-if="floor">
                <li>
                    <button type="button" class="btn navbar-btn btn-outline-warning show" v-if="!editing" v-on:click="toggleEditMode()">
                        <font-awesome-icon v-bind:icon="['fas', 'edit']" />
                        Edit
                    </button>
                    <button type="button" class="btn navbar-btn btn-outline-success edit" v-if="editing" v-on:click="toggleEditMode()">
                        <font-awesome-icon v-bind:icon="['fas', 'save']" />
                        Save
                    </button>
                </li>
            </ul>
        </nav>
        <div id="getting-started" class="row" v-if="!floor">
            <div class="col-sm-12 col-md-3 offset-md-3">
                <div class="card">
                    <div class="card-img-top text-center bg-dark text-light">
                        <font-awesome-icon class="fa-6x" v-bind:icon="['fas', 'plus-square']" />
                    </div>
                    <div class="card-body">
                        <h4 class="card-title">New</h4>
                        <p class="card-text">To get started, select "Manage Floors" and add a new floor.</p>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-3">
                <div class="card">
                    <div class="card-img-top text-center bg-dark text-light">
                        <font-awesome-icon class="fa-6x" v-bind:icon="['fas', 'play-circle']" />
                    </div>
                    <div class="card-body">
                        <h4 class="card-title">Continue</h4>
                        <p class="card-text">To continue working on a previous floorplan, select "Floorplan" and then "Import"</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" v-if="floor">
            <div id="left-side" class="col-sm-8">
                <div id="floor-card" class="card">
                    <div class="card-header">
                        <h5 v-show="!editing">{{floor.name}}</h5>
                        <h5 v-show="editing">Editing</h5>
                        <div id="floor-image-selector" class="input-group">
                            <input type="url" class="form-control" placeholder="Floor image" aria-label="Floor image"
                                   v-show="showImageInputField" v-model.lazy="floor.image" v-on:blur="onBlur('floorImage', floor.image)"/>
                            <div class="input-group-append">
                                <button type="button" class="btn btn-info" v-bind:class="{ 'inactive': !showImageInputField }"
                                        v-on:click="toggleImageInputField()">
                                    <font-awesome-icon v-bind:icon="['fas', 'image']" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="details">
                        <div id="floor-selector" class="btn-group-vertical">
                            <button type="button" class="btn btn-light" v-bind:disabled="!canGoUpALevel"
                                    v-on:click="selectFloor(selectedFloorIndex + 1)">
                                <font-awesome-icon v-bind:icon="['fas', 'chevron-up']"/>
                            </button>
                            <button type="button" class="btn btn-light" v-bind:disabled="!canGoDownALevel"
                                    v-on:click="selectFloor(selectedFloorIndex - 1)">
                                <font-awesome-icon v-bind:icon="['fas', 'chevron-down']"/>
                            </button>
                        </div>
                        <div id="floor">
                            <img v-bind:src="floor.image"/>
                            <floor-graph v-bind:editing="editing" v-bind:floor="floor" v-bind:selectedArea="selectedArea"
                                v-bind:onAreaSelection="selectArea"></floor-graph>
                        </div>
                        <div class="card-body" v-html="floor.description" v-show="!editing"></div>
                        <div class="edit-card-body" v-show="editing">
                            <div class="form-group">
                                <label for="edit-floor-name">Floor Name:</label>
                                <input id="edit-floor-name" type="text" class="form-control" placeholder="Floor title" aria-label="Floor title"
                                       v-model="floor.name" v-on:blur="onBlur('floorName', floor.name)"/>
                            </div>
                            <div class="form-group">
                                <label for="edit-floor-desc">Description:</label>
                                <summernote id="floorDesc" v-bind:height="260" v-bind:content="floor.description" v-bind:onBlur="onBlur"></summernote>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="right-side" class="col-sm-4" v-show="areaSelected">
                <div id="area-card" class="card">
                    <div class="card-header" v-show="!editing">
                        <h5>{{selectedArea.name}}</h5>
                    </div>
                    <div class="card-body details" v-html="selectedArea.description" v-show="!editing"></div>
                    <div class="card-header" v-show="editing">
                        <h5>Editing Area</h5>
                    </div>
                    <div class="edit-card-body" v-show="editing">
                        <div class="form-group">
                            <label for="edit-area-name">Area Name:</label>
                            <input type="text" class="form-control" v-model="selectedArea.name" v-on:blur="onBlur('areaName', selectedArea.name)"/>
                        </div>
                        <div class="form-group">
                            <label for="edit-area-desc">Description:</label>
                            <summernote id="areaDesc" v-bind:height="200" v-bind:content="selectedArea.description"
                                v-bind:onBlur="onBlur"></summernote>
                        </div>
                        <div class="form-group">
                            <label for="edit-area-hover-desc">Hover Description:</label>
                            <summernote id="areaHoverDesc" v-bind:height="70" v-bind:toolbar="[['media', ['picture']]]"
                                v-bind:content="selectedArea.hoverDescription" v-bind:onBlur="onBlur"></summernote>
                        </div>
                        <button type="button" class="btn btn-outline-danger" v-on:click="deleteArea()">
                            <font-awesome-icon v-bind:icon="['fas', 'trash-alt']" />
                            Delete Area
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="floorsModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="floorModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Manage floors</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <table class="table text-center">
                            <thead>
                                <tr>
                                    <th class="drag-helper-column"></th>
                                    <th>Position</th>
                                    <th>Name</th>
                                    <th>Options</th>
                                </tr>
                            </thead>
                            <draggable v-model="floorplan.floors" v-bind:element="'tbody'" v-on:change="changeFloorOrder">
                                <tr class="drag-helper" v-for="(listFloor, index) in floorplan.floors"
                                    v-bind:key="listFloor.uid">
                                    <td>
                                        <font-awesome-icon v-bind:icon="['fas', 'bars']" />
                                    </td>
                                    <td>{{index + 1}}</td>
                                    <td>{{listFloor.name}}</td>
                                    <td>
                                        <button class="btn btn-link" v-on:click="selectFloor(index)" title="Set active floor">
                                            <font-awesome-icon v-if="listFloor.uid === floor.uid" v-bind:icon="['fas', 'toggle-on']" />
                                            <font-awesome-icon class="text-secondary" v-if="listFloor.uid !== floor.uid"
                                                v-bind:icon="['fas', 'toggle-off']" />
                                        </button>
                                        <button class="btn btn-link text-danger" v-on:click="deleteFloor(index)" title="Delete floor">
                                            <font-awesome-icon v-bind:icon="['fas', 'trash-alt']" />
                                        </button>
                                    </td>
                                </tr>
                            </draggable>
                            <tfoot>
                                <tr>
                                    <td colspan="4">
                                        <button class="btn btn-success btn-block" v-on:click="addFloor()">
                                            <font-awesome-icon v-bind:icon="['fas', 'plus']" />
                                            Add floor
                                        </button>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <div class="mr-auto py-1 px-2 text-info">
                            <font-awesome-icon v-bind:icon="['fas', 'info-circle']" />
                            Floors can be reordered using drag-and-drop
                        </div>
                        <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="floorplanSettingsModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="floorModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Floorplan settings</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="floorplan-name" class="col-form-label">Name:</label>
                                <input id="floorplan-name" class="form-control" type="text" v-model="floorplan.name"
                                    placeholder="Floorplan name" v-on:blur="onBlur('floorplanName', floorplan.name)"/>
                            </div>
                            <div class="form-group">
                                <label for="floorplan-description" class="col-form-label">Description:</label>
                                <textarea id="floorplan-description" class="form-control" v-model="floorplan.description"
                                    rows="5" placeholder="Optional description" v-on:blur="onBlur('floorplanDesc', floorplan.description)"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script src="./app.component.js"></script>
<style lang="scss">
    @import './app.component.scss'
</style>
