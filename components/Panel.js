export default class Panel {
    constructor(context) {
        this.context = context;
    }

    draw(panel, orientation) {
        const context = this.context;
        const panelWidth = 135;

        context.fillStyle = "#555555";
        context.save();
        context.globalAlpha = .5;
        context.translate(panel.x, 0);
        context.fillRect(
            0, 0,
            panelWidth, 600
        );

        switch (orientation) {
            case 'left':
                context.translate(-panel.x + panelWidth, 0);
                break;
            case 'right':
                context.translate(-panel.x, 0);
                break;
            default:
                break;
        }

        context.globalAlpha = 1;
        context.fillStyle = "#cccccc";
        context.fillRect(
            panel.x-5, 280,
            10, 10
        );

        context.restore();
    }
}
