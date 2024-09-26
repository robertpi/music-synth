
/* ************************************************************* */
/* General constants                                             */
/* ************************************************************* */

/**
 * standard sampling rate
 * See: http://en.wikipedia.org/wiki/44,100_Hz
 */
const SampleRate = 44100;


/**
 * "Standard Pitch" noted as A440. The a note that is above middle c
 * See: http://en.wikipedia.org/wiki/A440_(pitch_standard)
 */
const A440 = 440;


/**
 * The ratio require to move from one semi-tone to the next
 * See: http://en.wikipedia.org/wiki/Semitone
 */
const semitone = Math.pow(2, 1 / 12);

/**
 * Since our Note enum is relative to c, we need to find middle c.
 * We know A440 = 440 hz and that the next c is three semi tones
 * above that, but this is c one ocative above middle c, so we
 * half the result to get middle c.
 * Middle c is around 261.626 Hz, and this approximately the value we get
 * See: http://en.wikipedia.org/wiki/C_(musical_note)
 */
const middleC = (A440 * Math.pow(semitone, 3)) / 2;

/**
 * beats per minute
 */
const bpm = 90.


/* ************************************************************* */
/* Note constants                                                */
/* ************************************************************* */

const  C         = 0
const  Csharp    = 1
const  Dflat     = 1
const  D         = 2
const  Dsharp    = 3
const  Eflat     = 3
const  E         = 4
const  Fflat     = 4
const  Esharp    = 5
const  F         = 5
const  Fsharp    = 6
const  Gflat     = 6
const  G         = 7
const  Gsharp    = 8
const  Aflat     = 8
const  A         = 9
const  Asharp    = 10
const  Bflat     = 10
const  B         = 11
const  Bsharp    = 12

/* ************************************************************* */
/* Note length constants                                         */
/* ************************************************************* */

const longa = 4;
const breve = 2;
const semibreve = 1;
const minim = 1 / 2;
const crotchet = 1 / 4;
const quaver = 1 / 8;
const semiquaver = 1 / 16;
const demisemiquaver = 1 / 32;

/* ************************************************************* */
/* functions for creating notes                                  */
/* ************************************************************* */

/**
 * Converts from our note enum to the notes frequency
 */
function frequencyOfNote(note, octave) {
    return (middleC * Math.pow(semitone, note)) 
            * Math.pow(2, octave - 4);
}

/**
 * calculates the distance you need to move in each sample
 */
function phaseAngleIncrementOfFrequency(frequency) {
    return frequency / SampleRate;
}

const beatsPerSemibreve = 4;

function beatsPerSecond(bmp) {
    return 60 / bmp;
}

function samplesPerBar(bmp) {
    return (SampleRate * beatsPerSecond(bmp)) * beatsPerSemibreve;
}


/**
 * caculates a note's length in samples
 */
function noteValue(bmp, note) {
    return ~~(samplesPerBar(bmp) * note);
}

/**
 * make a period of silence
 */
function makeSilence(length) {
    return Array(length).fill(0.0);
}

/**
 * make a wave using the given function, length and frequency
 */
function makeWave(waveFunc, length, frequency) {
    const phaseAngleIncrement = phaseAngleIncrementOfFrequency(frequency);
    return Array(Math.floor(length)).keys().map(x => {
        const phaseAngle = phaseAngleIncrement * x;
        const x_1 = Math.floor(phaseAngle);
        return waveFunc(phaseAngle - x_1);
    });
}

/**
 * make a wave using the given function, length note and octave
 */
function makeNote(waveFunc, length, note, octave) {
    const frequency = frequencyOfNote(note, octave);
    return Array.from(makeWave(waveFunc, length, frequency));
}

/* ************************************************************* */
/* functions for shaping notes                                   */
/* ************************************************************* */

/**
 * function for making a sine wave
 */
function sine(phaseAngle) {
    return Math.sin((2 * 3.141592653589793) * phaseAngle);
}

/**
 * function for making a square wave
 */
function square(phaseAngle) {
    if (phaseAngle < 0.5) {
        return -1;
    }
    else {
        return 1;
    }
}

/**
 * function for making triangular waves
 */
function triangle(phaseAngle) {
    if (phaseAngle < 0.5) {
        return 2 * phaseAngle;
    }
    else {
        return 1 - (2 * phaseAngle);
    }
}

/**
 * function for making right angle triangular waves
 */
function sawtooth(phaseAngle) {
    return -1 + phaseAngle;
}

/* ************************************************************* */
/* functions for transforming notes                              */
/* ************************************************************* */

/**
 * makes the waves amplitude large or small by scaling by the given multiplier
 */
function Transformation_scaleHeight(multiplier, waveDef) {
    return waveDef.map((x) => (x * multiplier));
}

/**
 * flattens the wave at the given limit to give an overdrive effect
 */
function Transformation_flatten(limit, waveDef) {
    return waveDef.map((x) => Math.max(-limit, Math.min(x, limit)));
}

/**
 * provides a way to linearly tapper a wave, the startMultiplier is
 * applied to the first value of the a wave, and endMultiplier is
 * applied to the last value, the other values have value that is linearly
 * interpolated between the two values
 */
function Transformation_tapper(startMultiplier, endMultiplier, waveDef) {
    const waveVector = Array.from(waveDef);
    const step = (endMultiplier - startMultiplier) / waveVector.length;
    return waveVector.map((x, i) => (x * (startMultiplier + (step * i))));
}

/**
 * Combines several notes into a chord
 */
function Transformation_combine(its) {
    const zip = (arr) => {
        const length = Math.max(...arr.map(a => a.length));
        return Array(length).fill().map((_,i) => arr.map(a => a[i]))
    };
    const arr = its.map(x => Array.from(x));
    const zipped = zip(arr);
    console.log(zipped.length);
    const combined = zipped.map(x => {
            var sum = 0;
            for(const y of x) {
                sum += y;
            } 
            return sum;
    }); 
    return combined;
  };

/* ************************************************************* */
/* functions outputing a wave in the WAV format                  */
/* ************************************************************* */

function WaveFormat_bytesOfInt16(i) {
    return [0, 8].map((shift) => {
        const value = ((i >> shift) & 255) | 0;
        return value & 0xFF;
    });
}

function WaveFormat_bytesOfInt(i) {
    return [0, 8, 16, 24].map((shift) => {
        const value = ((i >> shift) & 255) | 0;
        return value & 0xFF;
    });
}

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}


function WaveFormat_wavOfBuffer(buffer) {
    const sixteenBitLength = (2 * buffer.length) | 0;
    var outBuffer = [];
    var riff = "RIFF".split("").map(value => (value.charCodeAt(0) & 0xFF));
    outBuffer =  outBuffer.concat(riff);
    outBuffer =  outBuffer.concat(WaveFormat_bytesOfInt(sixteenBitLength + 15));
    var wave = "WAVE".split("").map(value => (value.charCodeAt(0) & 0xFF));
    outBuffer =  outBuffer.concat(wave);
    var fmt  = "fmt ".split("").map(value => (value.charCodeAt(0) & 0xFF));
    outBuffer =  outBuffer.concat(fmt);
    outBuffer =  outBuffer.concat([16, 0, 0, 0]); // fmt chunksize: 18
    outBuffer =  outBuffer.concat([1, 0]); // format tag : 1
    outBuffer =  outBuffer.concat([1, 0]); // channels
    outBuffer =  outBuffer.concat(WaveFormat_bytesOfInt(SampleRate));
    outBuffer =  outBuffer.concat(WaveFormat_bytesOfInt(2*SampleRate));
    outBuffer =  outBuffer.concat([4, 0]); // block align
    outBuffer =  outBuffer.concat([16, 0]); // bit per sample
    var data = "data".split("").map(value => (value.charCodeAt(0) & 0xFF));
    outBuffer =  outBuffer.concat(data);
    outBuffer = outBuffer.concat(WaveFormat_bytesOfInt(sixteenBitLength));
    var dataPart = buffer.map(tmp => WaveFormat_bytesOfInt16((value_5 = Math.round(tmp * 32767), (value_5 + 0x8000 & 0xFFFF) - 0x8000))).flat();
    outBuffer = outBuffer.concat(dataPart);
    return outBuffer;
}

/* ************************************************************* */
/* Display the WAV as a graph on a canvas                        */
/* ************************************************************* */

function Svg_displayWave(points) {
    const Svg_svg = document.getElementById("svg");

    const margin = 10;
    const lineSpacing = 1;
    const lineWidth = 1;
    const length = ~~(Svg_svg.clientWidth / lineSpacing) | 0;
    const midPoint = Svg_svg.clientHeight / 2;
    const maxLine = midPoint - margin;
    const chunkSize = ~~(points.length / length) | 0;
    console.log("chunkSize" + chunkSize);
    var samples = [];
    for (let i = 0; i < points.length; i += chunkSize) {
        const chunk = points.slice(i, i + chunkSize);
        console.log(chunk);
        const chunkSum = chunk.map(x => Math.abs(x)).reduce((a, b) => a + b);
        console.log(chunkSum);
        samples.push(chunkSum / chunk.length)
    }

    const svgns = "http://www.w3.org/2000/svg";
    for (let i_1 = 1; i_1 <= length; i_1++) {
        const size = samples[i_1] * maxLine;
        const y1 = midPoint - size;
        const y2 = midPoint + size;
        const line = document.createElementNS(svgns, "line");
        const x_3 = i_1 * lineSpacing;
        line.setAttributeNS(null, "x1", x_3.toString());
        line.setAttributeNS(null, "y1", y1.toString());
        line.setAttributeNS(null, "x2", x_3.toString());
        line.setAttributeNS(null, "y2", y2.toString());
        line.setAttributeNS(null, "stroke-width", lineWidth.toString());
        line.setAttributeNS(null, "stroke", "#000000");
        document.getElementById("svg").appendChild(line);
    }
}

/* ************************************************************* */
/* Finally put it all together to make music!                    */
/* ************************************************************* */


const tune = 
    [ 
        //C C G G A A AA G
        //Baa baa black sheep have you any wool?
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), C, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), C, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), G, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), G, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), A, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), A, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, quaver), A, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, quaver), A, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), G, 4)),
        //F F E E D D C
        //Yes sir yes sir three bags full.
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), F, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), F, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), E, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), E, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), D, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), D, 4)),
        Transformation_tapper(0.9, 0.1, makeNote(sine, noteValue(bpm, crotchet), C, 4)) 
    ].flat();

const cord =
    Transformation_flatten(0.9,
        Transformation_combine([ 
                Transformation_scaleHeight(0.3, makeNote(sine, noteValue(bpm, crotchet), C, 4)),
                Transformation_scaleHeight(0.3, makeNote(square, noteValue(bpm, crotchet), G, 4)),
                Transformation_scaleHeight(0.3, makeNote(sawtooth, noteValue(bpm, crotchet), A, 4)),
                ]));


function showAndPlay(input) {
    var inputArr = Array.from(input);
    const wav = WaveFormat_wavOfBuffer(inputArr);
    const wavBase64 = arrayBufferToBase64(wav);

    const Html_audio = document.getElementsByTagName("audio")[0];

    Html_audio.src = ("data:audio/wav;base64," + wavBase64);

    Svg_displayWave(inputArr);
}

window.addEventListener('load', function () {
    // change comments to change the record :-)
    showAndPlay(tune);
    // showAndPlay(cord);
});
