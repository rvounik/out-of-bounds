export default class Sound {
    /**
     * Plays given Audio object
     * @param {Object} audio - the Audio element to play
     * @param {boolean} loop - whether to loop or not (optional)
     */
    static playSound(audio, loop = false) {
        const soundToPlay = audio;

        if (loop) {
            soundToPlay[0].audio.loop = true;

            // experimental attempt to shave a few ms off the duration in order to force a more seamless loop
            soundToPlay[0].audio.addEventListener('timeupdate', function () {
                let buffer = .24; // a bit magic
                if (soundToPlay[0].audio.currentTime > soundToPlay[0].audio.duration - buffer) {

                    // restart sound (this does not use the built-in loop function since that is bugged)
                    soundToPlay[0].audio.currentTime = 0;
                    soundToPlay[0].audio.position = 0;
                    soundToPlay[0].audio.play();
                }
            }, false);
        }

        soundToPlay[0].audio.muted = false;
        soundToPlay[0].audio.play();
    }

    static stopSound(sound) {
        const soundToStop = sounds.filter(soundObj => soundObj.id === sound);
        soundToStop[0].audio.position = 0;
        soundToStop[0].audio.muted = true;
    }
}
