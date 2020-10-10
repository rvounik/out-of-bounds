export default class Spin {
    constructor(context) {
        this.context = context;
    }

    draw(spin) {
        const context = this.context;

        context.fillRect(340, 581, spin, 13);
    }
}
