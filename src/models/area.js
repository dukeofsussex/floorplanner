import { generateUID } from './util';

export default class Area {
    constructor({ name = '', description = '', hoverDescription = '', points = [] } = {}) {
        this.uid = generateUID();
        this.name = name;
        this.description = description;
        this.hoverDescription = hoverDescription;
        this.points = points;
    }
}
