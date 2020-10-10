export default class Sound {

    /**
     * Plays given Audio object
     * @param {Object} audio - the Audio element to play
     * @param {boolean} loop - whether to loop or not (optional)
     */
    static playSound(audio, loop = false) {
        if (loop) {
            audio[0].audio.loop = true;

            audio[0].audio.currentTime = 0;
            audio[0].audio.position = 0;

            // experimental attempt to shave a few ms off the duration in order to force a more seamless loop
            audio[0].audio.addEventListener('timeupdate', function () {
                let buffer = .24; // a bit magic
                if (audio[0].audio.currentTime > audio[0].audio.duration - buffer) {

                    // restart sound (this does not use the built-in loop function since that is bugged)
                    audio[0].audio.currentTime = 0;
                    audio[0].audio.position = 0;
                    audio[0].audio.play();
                }
            }, false);
        }

        audio[0].audio.muted = false;
        audio[0].audio.play();
    }

    /**
     * Stops given Audio object
     * @param {Object} audio - the Audio element to stop
     */
    static stopSound(audio) {
        audio[0].audio.position = 0;
        audio[0].audio.muted = true;
    }
}
