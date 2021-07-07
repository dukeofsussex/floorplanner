<template>
    <div :class="{ 'shrink': shrink }">
        <TheHeader @toggleSidebar="toggleSidebar" />
        <TheOctocat />
        <div class="container-fluid">
            <div class="row">
                <TheSidebar :f.sync="floors" />
                <TheView :f.sync="activeFloor" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import TheHeader from './components/TheHeader.vue';
    import TheOctocat from './components/TheOctocat.vue';
    import TheSidebar from './components/TheSidebar.vue';
    import TheView from './components/TheView.vue';
    import { Floor } from './models';
    import { Storage, generateDummyPlan, generateUID } from './util';

    @Component({
        components: {
            TheHeader,
            TheOctocat,
            TheSidebar,
            TheView,
        },
    })
    export default class App extends Vue {
        floors: Floor[] = [];

        shrink = false;

        get activeFloor(): Floor | undefined {
            return this.floors.find(f => f.active);
        }

        created() {
            this.floors = Storage.load() || generateDummyPlan();
        }

        @Watch('floors', { deep: true })
        autosave() {
            Storage.save(this.floors);
        }

        toggleSidebar() {
            this.shrink = !this.shrink;
        }
    }
</script>

<style lang="scss">
    @import '~bootstrap';

    $shrinkWidth: 80px;

    [role="main"] {
        padding-top: 50px; /* Space for fixed navbar */
    }

    @media (min-width: 768px) {
        .shrink {
            [role="main"] {
                flex: 0 0 calc(100% - #{$shrinkWidth});
                max-width: calc(100% - #{$shrinkWidth});
            }

            .navbar-brand {
                flex: 0 0 $shrinkWidth;
                max-width: $shrinkWidth;
                font-size: 0;
            }

            .sidebar {
                flex: 0 0 $shrinkWidth;
                max-width: $shrinkWidth;

                .nav-pills > .nav-item .nav-link {
                    font-size: 0;
                    padding-left: 0.25rem;
                    padding-right: 0.25rem;

                    svg {
                        font-size: initial;
                    }
                }

                .sidebar-heading {
                    margin-top: 0.25rem !important;
                    padding: 0.25rem !important;
                    font-size: 0;
                    justify-content: center !important;

                    span {
                        display: none;
                    }

                    svg {
                        margin: 0 !important;
                    }
                }
            }
        }
    }

    /* Fix naming collision between Bootstrap and v-tooltip */
    .tooltip {
        opacity: 1;
    }
</style>
