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
    import { Component, Vue } from 'vue-property-decorator';
    import TheHeader from './components/TheHeader.vue';
    import TheOctocat from './components/TheOctocat.vue';
    import TheSidebar from './components/TheSidebar.vue';
    import TheView from './components/TheView.vue';
    import { Floor } from './models';
    import { Storage, generateUID } from './util';

    @Component({
        components: {
            TheHeader,
            TheOctocat,
            TheSidebar,
            TheView,
        },
    })
    export default class App extends Vue {
        floors: Floor[] = [
            {
                active: true,
                areas: [
                    {
                        description: 'Test <strong>description</strong>',
                        hoverDescription: 'Hover text',
                        name: 'Area 1',
                        points: [
                            { x: 100, y: 100 },
                            { x: 150, y: 100 },
                            { x: 150, y: 150 },
                            { x: 100, y: 150 },
                        ],
                        uid: generateUID(),
                    },
                    {
                        description: '<i>Pretty</i>',
                        hoverDescription: 'Hoover',
                        name: 'Area 2',
                        points: [
                            { x: 200, y: 200 },
                            { x: 250, y: 200 },
                            { x: 250, y: 250 },
                            { x: 200, y: 250 },
                        ],
                        uid: generateUID(),
                    },
                ],
                description: '',
                image: 'http://i.imgur.com/oFZYfQwh.jpg',
                name: 'Floor 1',
                uid: generateUID(),
            },
            {
                active: false,
                areas: [
                    {
                        description: '<i>Real</i><strong>description</strong>',
                        hoverDescription: 'Hover text',
                        name: 'Area 1',
                        points: [
                            { x: 100, y: 100 },
                            { x: 150, y: 100 },
                            { x: 150, y: 150 },
                            { x: 100, y: 150 },
                        ],
                        uid: generateUID(),
                    },
                ],
                description: '',
                image: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Weakness_of_Turing_test_1.svg',
                name: 'Floor 2',
                uid: generateUID(),
            },
        ];

        small = false;

        get activeFloor(): Floor | undefined {
            return this.floors.find(f => f.active);
        }

        created() {
            const storedfloors = Storage.load();

            if (storedfloors !== null) {
                this.floors = storedfloors;
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
