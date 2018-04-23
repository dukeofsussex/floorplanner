export default class Area {
    constructor({ name = '', description = '', hoverDescription = '', points = [] } = {}) {
        this.uid = this.generateUID();
        this.name = name;
        this.description = description;
        this.hoverDescription = hoverDescription;
        this.points = points;
    }

    /* eslint-disable class-methods-use-this */
    generateUID() {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';

        for (let i = 0; i < 5; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}
