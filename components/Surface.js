import SurfaceTypes from './../constants/SurfaceTypes.js';
import Type from './../helpers/Type.js';

export default class Surface {
    constructor(context, imageId) {
        this.context = context;
        this.imageId = imageId;
    }

    draw(surface) {
        const context = this.context;

        let imageOffset = 0;
        let caption = '';
        let fontSize = 0;

        switch(surface) {
            case SurfaceTypes.FAIRWAY:
                imageOffset = 0;
                caption = SurfaceTypes.FAIRWAY;
                fontSize = 16.3;
                break;
            case SurfaceTypes.MID:
                imageOffset = 100;
                caption = SurfaceTypes.MID;
                fontSize = 13.7;
                break;
            case SurfaceTypes.ROUGH:
                imageOffset = 300;
                caption = SurfaceTypes.ROUGH;
                fontSize = 11.5;
                break;
            case SurfaceTypes.SAND:
                imageOffset = 200;
                caption = SurfaceTypes.SAND;
                fontSize = 12.8;
                break;
            case SurfaceTypes.WATER:
                imageOffset = 400;
                caption = SurfaceTypes.WATER;
                fontSize = 16.5;
                break;
            default:
                break;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(130, 20, 62, 62);

        context.drawImage(
            this.imageId['img'],
            imageOffset, 0,
            100, 100,
            132, 22,
            58, 58
        );

        Type.positionedText({ context, font: `${fontSize}px Teko `, text: caption, color: "#FFFFFF", x: 130, y: 97 });
    }
}
