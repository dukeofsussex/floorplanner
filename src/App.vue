<template>
    <div>
        <TheHeader @toggleSidebar="toggleSidebar" />
        <div class="container-fluid">
            <div class="row">
                <TheSidebar :small="small"
                            :fp.sync="floorplan" />
                <TheView :f.sync="activeFloor" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import TheHeader from './components/TheHeader.vue';
    import TheSidebar from './components/TheSidebar.vue';
    import TheView from './components/TheView.vue';
    import { Floor, Floorplan } from './models';
    import { Storage, generateUID } from './util';

    @Component({
        components: {
            TheHeader,
            TheSidebar,
            TheView,
        },
    })
    export default class App extends Vue {
        floorplan: Floorplan = {
            name: 'New floorplan',
            description: '',
            floors: [
                {
                    active: true,
                    areas: [],
                    description: '',
                    image: '',
                    name: 'Floor 1',
                    uid: generateUID(),
                },
                {
                    active: false,
                    areas: [],
                    description: '',
                    image: '',
                    name: 'Floor 2',
                    uid: generateUID(),
                },
            ],
        };

        small = false;

        get activeFloor(): Floor | undefined {
            return this.floorplan.floors.find(f => f.active);
        }

        created() {
            const storedFloorplan = Storage.load();

            if (storedFloorplan !== null) {
                this.floorplan = storedFloorplan;
            }
        }

        toggleSidebar() {
            this.small = !this.small;
        }
    }
</script>

<style lang="scss">
    @import '~bootstrap';
    @import '~bootstrap-vue';

    body {
        font-size: .875rem;
    }

    /*
     * Content
     */
    [role="main"] {
        padding-top: 133px; /* Space for fixed navbar */
    }

    @media (min-width: 768px) {
        [role="main"] {
            padding-top: 48px; /* Space for fixed navbar */
        }
    }
</style>
