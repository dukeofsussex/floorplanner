﻿export default class Storage {
    constructor() {
        this.floors = [{ "image": "https://i.imgur.com/Y9cDiqE.png", "name": "Riverside Main Floor", "description": "Just some random wacky description", "areas": [{ "uid": "ajf9v0", "points": [{ "x": 52, "y": 92 }, { "x": 50, "y": 151 }, { "x": 123, "y": 149 }, { "x": 125, "y": 91 }], "name": "Back stairwell", "description": "Stairs", "hoverDescription": "Hover 'n stuff" }, { "uid": "ufnf12", "points": [{ "x": 450, "y": 250 }, { "x": 700, "y": 250 }, { "x": 700, "y": 275 }, { "x": 450, "y": 275 }], "name": "Some botched bridge stairwell", "description": "Woopsee", "hoverDescription": "Fucked this one right up" }] }];
    }

    import(floors) {
        this.floors = JSON.parse(floors);
    }

    export() {
        return JSON.stringify(this.floors);
    }

    addFloor(floor) {
        this.floors.push(floor);
        return this.floors.length - 1;
    }

    getFloor(index) {
        return this.floors[index] || null;
    }

    updateFloor(floor, index) {
        this.floors[index] = floor;
        //localStorage.setItem('floorplanner_floors', JSON.stringify(this.floors));
    }

    deleteFloor(index) {
        this.floors.splice(index, 1);
    }
}
