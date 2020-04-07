export default class Canvas {

    /**
     * Clears the entire canvas by drawing a rectangle with the provided color (defaults to black)
     */
    static clearCanvas(context, color = '#000000') {
        context.fillStyle = color;
        context.fillRect(0, 0, 800, 600);
    }

    /**
     * Adds a context to the context collection with provided details if it does not exist yet
     */
    static clickableContext(clickableContexts, id, x, y, width, height, action) {
        if (clickableContexts.filter(clickableContext => clickableContext.id === id).length === 0) {
            clickableContexts.push({ id, x, y, width, height, action });
        }
    }
}
