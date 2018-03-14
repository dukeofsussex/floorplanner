export default class Storage {
    importJSON() {

    }

    exportJSON() {

    }

    get() {

        // For testing, replace with localStorage
        return {
            floors: [
                {
                    image: 'https://i.imgur.com/Y9cDiqE.png',
                    name: 'Riverside Main Floor',
                    description: 'Just some random wacky description',
                    areas: [
                        {
                            uid: 'ajf9v0',
                            points: [
                                {
                                    x: 52,
                                    y: 92
                                },
                                {
                                    x: 50,
                                    y: 151
                                },
                                {
                                    x: 123,
                                    y: 149
                                },
                                {
                                    x: 125,
                                    y: 91
                                }
                            ],
                            name: 'Back stairwell',
                            description: 'Stairs',
                            hoverDescription: 'Hover \'n stuff'
                        },
                        {
                            uid: 'ufnf12',
                            points: [
                                {
                                    x: 450,
                                    y: 250
                                },
                                {
                                    x: 700,
                                    y: 250
                                },
                                {
                                    x: 700,
                                    y: 275
                                },
                                {
                                    x: 450,
                                    y: 275
                                }
                            ],
                            name: 'Some botched bridge stairwell',
                            description: 'Woopsee',
                            hoverDescription: 'Fucked this one right up'
                        }
                    ]
                }
            ]
        };
    }

    set() {

    }
}
