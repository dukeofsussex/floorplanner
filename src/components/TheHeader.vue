<template>
    <nav class="navbar navbar-dark fixed-top bg-dark p-0 shadow">
        <a class="navbar-brand col-md-3 col-lg-2"
           href="#">
            <img src="@/assets/logo.png"
                 width="30"
                 height="30"
                 class="d-inline-block align-top"
                 alt="Navbar logo">
            Floorplanner
        </a>
        <ul class="navbar-nav d-none d-md-flex mr-auto">
            <li class="nav-item text-nowrap">
                <button class="btn text-light"
                        type="button"
                        @click="$emit('toggleSidebar')">
                    <FaIcon :icon="['fa', 'bars']" />
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
        padding-top: .625rem;
        padding-bottom: .625rem;
        background-color: rgba(0, 0, 0, .25);
        box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
    }
</style>
