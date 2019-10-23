import { generateUID } from './util';

export default class Floor {
    constructor({
        image = '', name = '', description = '', areas = [],
    } = {}) {
        this.uid = generateUID();
        this.image = image;
        this.name = name;
        this.description = description;
        this.areas = areas;
    }
}
