<template>
    <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a class="navbar-brand col-sm-3 col-md-2"
           href="#">
            Floorplanner
        </a>
        <ul class="navbar-nav mr-auto">
            <li class="nav-item text-nowrap">
                <button class="btn btn-link nav-link"
                        @click="$emit('toggleSidebar')">
                    Toggle Button
                </button>
            </li>
        </ul>
    </nav>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';

    @Component
    export default class TheHeader extends Vue { }
</script>

<style lang="scss" scoped>
    .navbar-brand {
        padding-top: .75rem;
        padding-bottom: .75rem;
        font-size: 1rem;
        background-color: rgba(0, 0, 0, .25);
        box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
    }
</style>
