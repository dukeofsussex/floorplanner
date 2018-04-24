/* eslint-disable import/prefer-default-export */
export function generateUID() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';

    for (let i = 0; i < 5; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
