# MinuteSynth Reference

This is a reference for the MinuteSynth wrapper library for WebAudio found in modern web browsers. For more of a practical guide on usage, please refer to the [Intro Document](intro.md).

## Inclusion

To incorporate MinuteSynth into your HTML/ES6 JavaScript project, include the script contents of `minutesynth.js`:

```html
<script src="minutesynth.js"></script>
```

This creates a couple global helper functions and also the `M$` MinuteSynth factory object.

## Instanciation

```javascript
M$(ac = DEFAULT_AUDIOCONTEXT)
```

Create an instance of MinuteSynth that's bound to your `AudioContext` by calling `M$()`. (You can specify your own, or leave undefined to use the default one that goes to your platform's sound output). The object that is created is then a factory object that allows you to create all MinuteSynth modules.

Note that you may need to do this from within a click or other type of window interaction handler in order for the web browser to let you generate sound.

For an example of creating a MinuteSynth instance that records to a memory buffer, rather than going to the platform's sound output, see the `record8()` function in `support/recorder.js`.

## Module Factory Reference

// Osc (Oscillaor) is a simple tone generator. Specify its type and also scale, which can transform
  // the incoming base frequency when the module is triggered. Specify r and i arrays for periodic wave.
  // Params: t: type; S: scale; f: default frequency; d: detune, g: gain; s: start time; r: real values;
  //         i: imag. values, n: nominal playback frequncy (for custom waveform)
  // Type: 1 = sine, 2 = square, 3 = sawtooth, 4 = triangle, 5 = custom
  Osc({t, S = 1, f, d, g = 1, s = 0, r, i, n = 1})

  // Convenience/clarity constants for t: type:
  sine: 1,
  square: 2,
  sawtooth: 3,
  triangle: 4,
  custom: 5,

  // Buf (Buffer) represents a block of memory that specifies samples. Access the memory with x();
  // the length of the buffer is length. Call L() to lock in the memory so that the buffer can be used.
  // Params: T: duration; c: channels; S: scale; g: gain; s: start time; F: sampling rate
  //         r: playback rate; d: detune; n: nominal playback frequency (0 for no freq. control)
  Buf({T = 1, c = 1, S = 1, g = 1, s = 0, F = U.SR, r = 1, d, n = 0, f})

---

### Noise

`Noise({ g=1, s=0, r, d })`

Noise produces a playable buffer of noise.

Params: `g:` gain; `s:` start time (non-patchable), `r:` playback rate, `d:` detune

---

### Pulse

`Pulse({ w=0.1, o=0, S=1, f, g=1, s=0, W=1024 })`

Pulse produces a pulse waveform of width w at offset o.

Params: `w:` pulse width (0-1) (non-patchable); `o:` pulse offset (0-1) (non-patchable); `S:` scale; `f:` default frequency (non-patchable); `g:` gain; `s:` start time (non-patchable), `W:` samples (non-patchable)

---

### Dist

`Dist({ a=50, F=M$.dw(a), g=1, r$ })`

Distort performs a wave-shaping operation, allowing for remapping of sampled wave amplitudes.

Params: `F:` distort function (default: `M$.dw()`), `a:` function parameter (non-patchable), `r$:` input

---

### Filt

`Filt({ t, q, f, S=1, b, g=1, r$ })`

Filter allows for filtering of sound using the filter type provided in `t`.

Params: `t:` type (non-patchable), `q:` Q value, `f:` frequency, `S:` scale, `b:` boost, `g:` gain, `r$:` input

The `t` "type" parameter may take any one of the following:
 
| Attribute | Index | WebAudio String |
|-|-|-|
| M$.lowpass | 1 | 'lowpass' |
| M$.highpass | 2 | 'highpass' |
| M$.bandpass | 3 | 'bandpass' |
| M$.lowshelf | 4 | 'lowshelf' |
| M$.highshelf | 5 | 'highshelf' |
| M$.peaking | 6 | 'peaking' |
| M$.notch | 7 | 'notch' |
| M$.allpass | 8 | 'allpass' |

---

### Conv

`Conv({ b, g=1, n=true, r$ })`

Convolver sets up a convolution using a kernel set up in a BufferNode object. `b: M$.reverb(...)` can be used for a simple reverb effect.

Params: `b:` BufferNode (non-patchable object), `g:` gain, `n:` normalize (true by defualt, non-patchable value), `r$:` input

---

 // Comp (Compressor) 
  // Params: t: threshold, k: knee, o: ratio, d: reduction, a: attack, r: release
  Comp({ t, k, o, d, a, r, g=1, r$})

 // C (Constant) provides a steady value that can also be manipulated through the 'v' Param.
  C(v = 0)

// Gain (Amplifier) is a very simple module that acts as a multiplier.
  // Params: g: gain value; r$: input
  Gain({ g = 1, r$ } = {})

// ADSR (Attack, Decay, Sustain, Release) uses ADSR parameters to create a module that
  // can allow values to ramp up and down whenever the module is triggered. Use the t$ 
  // (second parameter) to reverse-bind a trigger.
  ADSR(adsr = U._DEFAULT_ADSR, t$)

   // Prog (Program) orchestrates a series of values on a constant output that can be triggered.
  // Params: t: timesteps (seconds from trigger) array, v: values array, p: portamento (glide) time
  Prog({ t, v, p = 0 })

  // Spec (Spectrum) creates a complex oscillator waveform from a series of real frequencies.
  // Gains are defaulted to 1 unless an array of gains are specified.
  // Params: F: Array of frequencies, G: Array of gains (default: 1's), n = nominal frequency, R = sample size
  Spec({ F, G, n = 440, R = U.SR/4, f, s = 0, g = 1, S = 1 })

  // Freq (FreqModule) is like a voltage control to attach to oscillators and other frequency inputs.
  // It centrally manages a frequency and optionally has a glide (portamento) capability.
  // Use the t$ (second parameter) to reverse-bind a trigger.
  Freq({ p = 0, t$ } = {})

// Voice represents a single channel of sound that is controlled by one main frequency.
  // The gain g is the final "volume control" and its output is the AudioContext's destination.
  // Set v to zero to disable attaching to ac.destination. You can get final WebAudio from .z.
  // An automatically generated frequency controller is available at .f.
  Voice({ g = 0.5, v = 1, p, r$ } = {})



## Common Method Reference

### All Modules

**`.$(target)`:** Forward-patch: Patches the default output of the module this is called on to the default input of the `target` module or patchable parameter.

**`.r$(source)`:** Reverse-patch: Acts in the reverse direction of the `.$()` method; allows for the default output of the `source` module or patchable parameter to be patched to the default input of this module or patchable parameter. In addition:

* When called with an array as a parameter, all patches are added together.
* When called repeatedly, all patches are added together.
* Direct numbers may be specified to patch a constant value, except if an array is used. If an array is used, then that direct number must be passed as a `M$.C` (Constant) object.

**`.del()`:** Destroy: Explicitly disconnects the underlying AudioNode objects to facilitate the shutdown and garbage collection of WebAudio objects. This may be important for appropriately freeing up CPU resources when modules are no longer needed. It is probably only necessary to call this on the top-level module; e.g. `M$.Voice`.

### Patchable Parameters

**`.r$(source)`:** Reverse-patch: Same operation as `.r$()` for modules.

**See Also** the "Lower Level Controls" section of the [Intro](intro.md) Document.

## Additional Utility Methods

The MinuteSynth `$M` object also contains a couple of extra methods that are used for specific purposes:

**`.now()`:** Current AudioContext time: Returns the current time for the AudioContext; useful for time-dependent operations that require a time to be speficied.

**`.reverb(fadeInTime, decayTime, subsample, numChan = 2)`:** Create Simple Reverb convolution kernel: This is used to create a kernel that can be fed into the `M$.Conv` module. Borrowed from: https://github.com/adelespinasse/reverbGen/blob/master/reverbgen.js

* **fadeInTime:** Number of seconds to allow reverb to fade in
* **decayTime:** Similar for the length of the reverberation
* **subsample:** Another parameter that you'll need to play with. Example: `0.95`
* **numChan:** Number of audio channels to render. If this is `2`, then it can result in a "chorus" stereo effect.

**`.dw(amount = 50, W = 8192)`:** Sample distortion effect, borrowed from https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion

## Helper Functions

When `minutesynth.js` is included into HTML, a couple of global helper functions are created.

**`$A(source, target)`:** Assign: Copies contents of `source` to `target` and returns result. It is used to allow shorthand late-binding self-references from within objects by calling `Object.assign()`.

**`$R(range = 2, lowest = -1)`:** Random: Returns a random number in [*lowest*, *lowest* + *range*], by default in [-1, 1].

**`$Y(inputs, function)`:** Apply: Calls the given function *function* on the input *input* or each element of *input* if an array is given.
