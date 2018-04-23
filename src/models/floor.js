import Area from './area';

export default class Floor {
    constructor({ image = '', name = '', description = '', areas = [new Area()] } = {}) {
        this.image = image;
        this.name = name;
        this.description = description;
        this.areas = areas;
    }
}
