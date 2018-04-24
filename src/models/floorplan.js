export default class Floorplan {
    constructor({ name = '', description = '', floors = [] } = {}) {
        this.name = name;
        this.description = description;
        this.floors = floors;
    }
}
