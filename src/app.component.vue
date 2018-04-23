<template>
    <div>
        <div class="container-fluid bg-light">
            <nav class="navbar navbar-expand-sm fixed-top navbar-light bg-dark">
                <a class="navbar-brand text-white" href="#">Floorplanner</a>
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-white" href="#" id="fileDropdown" role="button" data-toggle="dropdown"
                           aria-haspopup="true" aria-expanded="false">
                            File
                        </a>
                        <div class="dropdown-menu" aria-labelledby="fileDropdown">
                            <a id="import" class="dropdown-item" href="#">Import</a>
                            <input id="file-import" type="file" accept=".json" />
                            <a id="export" class="dropdown-item" href="#">Export</a>
                        </div>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-white" href="#" id="editDropdown" role="button" data-toggle="dropdown"
                           aria-haspopup="true" aria-expanded="false">
                            Floors
                        </a>
                        <div class="dropdown-menu" aria-labelledby="editDropdown">
                            <a class="dropdown-item" href="#" role="button" data-toggle="modal" data-target="#floorModal">
                                Add
                            </a>
                            <a id="delete-floor" class="dropdown-item" href="#">Delete</a>
                        </div>
                    </li>
                </ul>
                <ul class="nav navbar-nav navbar-right">
                    <li>
                        <button type="button" class="btn navbar-btn btn-outline-primary toggle-mode show">Edit</button>
                        <button type="button" class="btn navbar-btn btn-outline-success toggle-mode edit hidden">Save</button>
                    </li>
                </ul>
            </nav>
        </div>
        <div id="interface" class="container-fluid bg-light">
            <div class="row">
                <div id="left-side" class="col-sm-8">
                    <div id="show-floor" class="card">
                        <div class="card-header show">
                            <h5 id="show-floor-name"></h5>
                        </div>
                        <div style="background: #ffcdcd" class="card-header edit hidden">
                            <h5>Editing</h5>
                        </div>
                        <div id="show-floor-details">
                            <div id="floorplan">
                                <img id="floor-image" />
                                <svg viewBox="0 0 920 690"></svg>
                            </div>
                            <div id="show-floor-desc" class="card-body show"></div>
                            <div class="edit edit-card-body hidden">
                                <div class="form-group">
                                    <label for="edit-floor-name">Floor Name:</label>
                                    <input type="text" id="edit-floor-name" class="form-control" placeholder="Floor title" aria-label="Floor title" />
                                </div>
                                <div class="form-group">
                                    <label for="edit-floor-desc">Description:</label>
                                    <div id="edit-floor-desc"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="right-side" class="col-sm-4">
                    <div id="show-area" class="card hidden">
                        <div class="card-header">
                            <h5 id="show-area-name">Area name</h5>
                        </div>
                        <div id="show-area-desc" class="card-body">
                            Area Description
                        </div>
                    </div>
                    <div id="edit-area" class="card hidden">
                        <div style="background: #ffcdcd" class="card-header">
                            <h5>Editing Area</h5>
                        </div>
                        <div class="edit-card-body">
                            <div class="form-group">
                                <label for="edit-area-name">Area Name:</label>
                                <input type="text" id="edit-area-name" class="form-control"/>
                            </div>
                            <div class="form-group">
                                <label for="edit-area-desc">Description:</label>
                                <div id="edit-area-desc"></div>
                            </div>
                            <div class="form-group">
                                <label for="edit-area-hover-desc">Hover Description:</label>
                                <div id="edit-area-hover-desc"></div>
                            </div>
                            <button id="delete-area" type="button" class="btn btn-outline-danger">Delete Area</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="modal fade" id="floorModal" tabindex="-1" role="dialog" aria-labelledby="floorModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="floorModalLabel">Add floor</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="url" class="form-control" id="floor-image-url" placeholder="Floorplan URL" aria-label="Floorplan URL"/>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="floor-loader" class="btn btn-outline-primary" data-dismiss="modal">Add floor</button>
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
