(function() {
    // Create audio (context) container
    var audioCtx = new (AudioContext || webkitAudioContext)();

    // Table of notes with correspending keyboard codes. Frequencies are in hertz.
    // The notes start from middle C
    var notesByKeyCode = {
        90: { frequency: 329.6, keyName: 'Z' },
        88: { frequency: 349.2, keyName: 'X' },
        67: { frequency: 392, keyName: 'C' },
        86: { frequency: 440, keyName: 'V' },
        66: { frequency: 493.9, keyName: 'B' },
        78: { frequency: 523.3, keyName: 'N' }
    };

    function Key(noteName, keyName, frequency) {
        var keyHTML = document.createElement('button');
        var keySound = new Sound(frequency, 'triangle');

        /* Style the key */
        keyHTML.className = 'keyBtn';
        keyHTML.innerHTML = keyName;

        return {
            html: keyHTML,
            sound: keySound
        };
    }

    function Sound(frequency, type) {
        this.osc = audioCtx.createOscillator(); // Create oscillator node
        this.pressed = false; // flag to indicate if sound is playing

        /* Set default configuration for sound */
        if(typeof frequency !== 'undefined') {
            /* Set frequency. If it's not set, the default is used (440Hz) */
            this.osc.frequency.value = frequency;
        }

        /* Set waveform type. Default is actually 'sine' but triangle sounds better :) */
        this.osc.type = type || 'triangle';

        /* Start playing the sound. You won't hear it yet as the oscillator node needs to be
        piped to output (AKA your speakers). */
        this.osc.start(0);
    };

    Sound.prototype.play = function() {
        if(!this.pressed) {
            this.pressed = true;
            this.osc.connect(audioCtx.destination);
        }
    };

    Sound.prototype.stop = function() {
        this.pressed = false;
        this.osc.disconnect();
    };

    function createKeyboard(notes, containerId) {
        var sortedKeys = []; // Placeholder for keys to be sorted
        var waveFormSelector = document.getElementById('soundType');

        for(var keyCode in notes) {
            var note = notes[keyCode];

            /* Generate playable key */
            note.key = new Key(note.noteName, note.keyName, note.frequency);

            /* Add new key to array to be sorted */
            sortedKeys.push(notes[keyCode]);
        }

        /* Sort keys by frequency so that they'll be added to the DOM in the correct order */
        sortedKeys = sortedKeys.sort(function(note1, note2) {
            if (note1.frequency < note2.frequency) return -1;
            if (note1.frequency > note2.frequency) return 1;

            return 0;
        });

        // Add those sorted keys to DOM
        for(var i = 0; i < sortedKeys.length; i++) {
            document.getElementById(containerId).appendChild(sortedKeys[i].key.html);
        }

        var playNote = function(event) {
            var keyCode = event.keyCode;

            if(typeof notesByKeyCode[keyCode] !== 'undefined') {
                // Pipe sound to output (AKA speakers)
                notesByKeyCode[keyCode].key.sound.play();

                // Highlight key playing
                notesByKeyCode[keyCode].key.html.className = 'keyBtn keyPlaying';
            }
        };

        var endNote = function(event) {
            var keyCode = event.keyCode;

            if(typeof notesByKeyCode[keyCode] !== 'undefined') {
                // Kill connection to output
                notesByKeyCode[keyCode].key.sound.stop();

                // Remove key highlight
                notesByKeyCode[keyCode].key.html.className = 'keyBtn';
            }
        };

        var setWaveform = function(event) {
            for(var keyCode in notes) {
                notes[keyCode].key.sound.osc.type = this.value;
            }

            // Unfocus selector so value is not accidentally updated again while playing keys
            this.blur();
        };

        // Check for changes in the waveform selector and update all oscillators with the selected type
        waveFormSelector.addEventListener('change', setWaveform);

        window.addEventListener('keydown', playNote);
        window.addEventListener('keyup', endNote);
    }

    window.addEventListener('load', function() {
        createKeyboard(notesByKeyCode, 'keyboard');
    });
})();
