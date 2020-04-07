export default class Canvas {
    static clearCanvas(context, color = '#17411D') {
        context.fillStyle = color;
        context.fillRect(0, 0, 800, 600);
    }
}
