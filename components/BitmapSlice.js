export default class BitmapSlice {
	constructor(x,y,w,h,context,imageId) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.context = context;
		this.imageId = imageId;
	}

	draw(offset, resolution) {
		// const scaleFactor = (this.y - 300) / 300; // 0.99999 ... 0.000001
		// const theInvert = 1 / scaleFactor; // 1 ....... 100000

		const context = this.context;
		// context.save();
		// context.translate(0, this.y);
		// context.scale(scaleFactor, scaleFactor); // this screws everything up. better play with bitmap dimensions (the last value) instead
		// context.fillStyle='#000';
		// //context.fillRect(0,0,800*theInvert,resolution*theInvert); // this is what the container should be
		// context.fillRect(0,0,800*theInvert,1*theInvert);

        context.drawImage(
            this.imageId['img'],
            0, (this.y*.96*10)-offset+300, 960, 10,
            200-(this.y*5), 300+(this.y*.96*10), 200+(this.y*10), 10
        );


		// context.drawImage(
		// 	this.imageId['img'],
		// 	0 , 0, /* container position */
		// 	theInvert*800, theInvert*resolution, /* container dimensions (beware of overlap, this does not mask!) */
		// 	theInvert*(400-(scaleFactor*400)), ((0+((this.y-300)))/scaleFactor ), /* bitmap position */
		// 	(theInvert*800), resolution*theInvert /* bitmap dimensions */
		// );

		// console.log( scaleFactor, theInvert*((this.y-300)/scaleFactor) )
		//context.restore();
    }
}

// export default class Fake3d
// {
//     constructor(context) {
//         this.image = new Image();
//         this.image.src = 'assets/texture.png';
//         this.startUpdating = false;
//         this.image.onload = () => { this.startUpdating = true; };
//         this.counter = 0;
//         this.context=context;
//     }
//     update() {
//         if (this.startUpdating) {
//             this.draw();
//         }
//         this.counter+=0.3;
//     }
//     draw() {
//         const context = this.context;
//
//         // sx === positie op afbeelding
//         // dx === positie op het canvas
//         // ctx.drawImage(
//         //      image,
//         //      sx, sy, sWidth, sHeight,
//         //      dx, dy, dWidth, dHeight
//         // );
//         for (let y = 0 ; y < 30 ; y++) {
//             context.drawImage(
//                 this.image,
//                 0, (y*.96*10)-this.counter+300, 960, 10,
//                 200-(y*5), 300+(y*.96*10), 200+(y*10), 10
//             );
//         }
//     }
// }
