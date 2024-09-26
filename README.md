# Music Synth Coding Kata

Generate notes in your browser with Javascript, from scratch, no dependencies. Sequence 
notes into music music. Create music through live coding.

# Inspiration

* [Overtone](https://overtone.github.io/)
* [SonicPi](https://sonic-pi.net/)
* [Undertone](https://fable.io/repl/) "Samples" > "Fun and Games" > "Undertone - Programmable music"

# Sound Waves

Sound is a mechanical wave that is an oscillation of pressure transmitted through a solid, liquid, or gas, composed of frequencies within the range of hearing

Sound that is perceptible by humans has frequencies from about 20 Hz to 20,000 Hz

The below diagram shows a compression wave and chart measuring it's amplitude vs time.

![sound waves](img/sounds-waves.png)

## Notes

Notes are sounds at standard frequencies.

A440 is the musical note A above middle C, which has a frequency of 440 Hz and serves as a general tuning standard for musical pitch

An octave is the interval between one musical pitch and another with half or double its frequency.

If one note has a frequency of 440 Hz, the note an octave above it is at 880 Hz, and the note an octave below is at 220 Hz.

A semitone, also called a half step or a half tone, is the smallest musical interval commonly used in Western tonal music.

There eight notes in an octave, but 12 semitones.

Notes uneven distributed semitones aren’t.

| Note | Enharmonic | Semitones |
|------|------------|-----------|
| C	    |            | 0         |
| C♯   | D♭         | 1         |
| D    |            | 2         |
| E♭   | D♯         | 3         |
| E	    | F♭         | 4         |
| F    | E♯         | 5         |
| F♯   | G♭         | 6         |
| G    |            | 7         |
| G♯   | A♭         | 8         |
| A    |            | 9         |
| B♭	   | A♯         | 10        |
| B    |            | 11        |
| C    | B♯         | 12        |

## Modeling Sound

To model sound we need to model the wave. The simplest way to do this is use a collection of floats with values between 1.0 and -1.0 representing the amplitude of the wave.

To do this we first need to define a sample rate, which is the frequency at which samples will be collected / played back. The industry standard for this is 44,100Hz.

Give the sample rate, each sample in the frequence represents the amplitude of the wave at a current time. The time is calculated implicitly from the period of the sample frequency.

![sound waves](img/signal-sampling.png)


## Generating a Note

Once we know the sample rate, given the frequence of a note, we can calculate the rate of change change required to make an oscillation in the notes period.
This is known as the phase angle.

Once we've calculated the phase


## Playing Sound

# The Exercise 