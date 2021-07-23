export default class Type {

    /**
     * Renders the provided text at given coordinates. When x value is not provided it will center the text automatically
     * @param {Object} cfg - the configuration object
     * @param {Object} cfg.context - the context object
     * @param {string} [cfg.font = "30px Arial"] - the requested text font (optional)
     * @param {string} [cfg.color = "#ffffff"] - the requested text color (optional)
     * @param {string} cfg.text - the text to render
     * @param {number} [cfg.x = 0] - the x position of the text (optional)
     * @param {number} cfg.y - the y position of the text
     */
    static positionedText(cfg) {
        cfg.context.font = cfg.font || "30px Arial";
        cfg.context.fillStyle = cfg.color || "#ffffff";
        cfg.context.fillText(cfg.text, (!cfg.x && cfg.x !== 0) ? (800 / 2) - (cfg.context.measureText(cfg.text).width / 2) : cfg.x, cfg.y);
    }
}
