<template>
    <div>
        <TheHeader @toggleSidebar="toggleSidebar" />
        <TheOctocat />
        <div class="container-fluid">
            <div class="row">
                <TheSidebar :small="small"
                            :f.sync="floors" />
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

        small = false;

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
            this.small = !this.small;
        }
    }
</script>

<style lang="scss">
    @import '~bootstrap';

    [role="main"] {
        padding-top: 133px; /* Space for fixed navbar */
    }

    @media (min-width: 768px) {
        [role="main"] {
            padding-top: 48px; /* Space for fixed navbar */
        }
    }

    /* Fix naming collision between Bootstrap and v-tooltip */
    .tooltip {
        opacity: 1;
    }
</style>
