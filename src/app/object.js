export class Floor {
    constructor({ image = '', name = '', description = '', areas = [new Area()] } = {}) {
        this.image = image;
        this.name = name;
        this.description = description;
        this.areas = areas;
    }
}

export class Area {
    constructor({ name = '', description = '', hoverDescription = '', points = [] } = {}) {
        this.uid = this.generateUID();
        this.name = name;
        this.description = description;
        this.hoverDescription = hoverDescription;
        this.points = points;
    }

    generateUID() {
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";

        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}