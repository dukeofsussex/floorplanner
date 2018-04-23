import Floor from './floor';

export default class Floorplan {
    constructor({ name = '', description = '', floors = [new Floor()] } = {}) {
        this.name = name;
        this.description = description;
        this.floors = floors;
    }
}
