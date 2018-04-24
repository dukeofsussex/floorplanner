/*
const defaultTestFloorplan = {
    name: 'Default floorplan',
    description: 'Just a default floorplan',
    floors: [
        {
            image: 'https://i.imgur.com/Y9cDiqE.png',
            name: 'Riverside Main Floor',
            description: 'Just some random wacky description',
            areas: [
                {
                    uid: 'ajf9v0',
                    points: [{ x: 52, y: 92 }, { x: 50, y: 151 }, { x: 123, y: 149 }, { x: 125, y: 91 }],
                    name: 'Back stairwell',
                    description: 'Stairs',
                    hoverDescription: 'Hover \'n stuff',
                }, {
                    uid: 'ufnf12',
                    points: [{ x: 450, y: 250 }, { x: 700, y: 250 }, { x: 700, y: 275 }, { x: 450, y: 275 }],
                    name: 'Some botched bridge stairwell',
                    description: 'Woopsee',
                    hoverDescription: 'Fucked this one right up',
                },
            ],
        },
    ],
};
*/

export default class Storage {
    constructor() {
        this.localStorageKey = 'floorplanner:floorplan';

        if (localStorage.getItem(this.localStorageKey) === null) {
            this.floorplan = null;
        } else {
            this.floorplan = JSON.parse(localStorage.getItem(this.localStorageKey));
        }
    }

    import(floorplanString) {
        // validate imported floorplan
        this.floorplan = JSON.parse(floorplanString);
        this.saveToLocalStorage();
    }

    export() {
        return JSON.stringify(this.floorplan);
    }

    addFloorplan(floorplan) {
        this.floorplan = floorplan;
        this.saveToLocalStorage();
    }

    getFloorplan() {
        return this.floorplan;
    }

    updateFloorplan(floorplan) {
        this.floorplan = floorplan;
        this.saveToLocalStorage();
    }

    deleteFloorplan() {
        this.floorplan = null;
        this.deleteLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.floorplan));
    }

    deleteLocalStorage() {
        localStorage.removeItem(this.localStorageKey);
    }
}
