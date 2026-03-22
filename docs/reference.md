# MinuteSynth Reference <!-- omit in toc -->

This is a reference for the MinuteSynth wrapper library for WebAudio found in modern web browsers (plus a handful of additional functions). For more of a practical guide on usage, please refer to the [Intro Document](intro.md).

- [Inclusion](#inclusion)
- [instantiation](#instantiation)
- [Module Factory Reference](#module-factory-reference)
  - [ADSR (Attack, Decay, Sustain, Release)](#adsr-attack-decay-sustain-release)
  - [Buf (Buffer)](#buf-buffer)
  - [C (Constant)](#c-constant)
  - [Comp (Compressor)](#comp-compressor)
  - [Conv (Convolver)](#conv-convolver)
  - [Dist (Distorter)](#dist-distorter)
  - [Filt (Filter)](#filt-filter)
  - [Frequency Controller](#frequency-controller)
  - [Gain](#gain)
  - [Noise](#noise)
  - [Osc (Oscillator)](#osc-oscillator)
  - [Prog (Program)](#prog-program)
  - [Pulse](#pulse)
  - [Spec (Spectrum)](#spec-spectrum)
  - [Voice](#voice)
  - [Special AudioNode Adaptor](#special-audionode-adaptor)
  - [Others TODO](#others-todo)
- [Common Method Reference](#common-method-reference)
  - [All Modules](#all-modules)
  - [Patchable Parameter Objects](#patchable-parameter-objects)
- [Additional Utility Methods](#additional-utility-methods)

## Inclusion

To incorporate MinuteSynth into your HTML/ES6 JavaScript project, include the script contents of `minutesynth.js`:

```html
<script src="minutesynth.js"></script>
```

This creates a couple global helper functions and also the `MinuteSynth` class and namespace.

## instantiation

```javascript
const m$ = new MinuteSynth(ac = DEFAULT_AUDIOCONTEXT)
```

Create an instance of MinuteSynth that's bound to your `AudioContext` by calling `MinuteSynth()`. (You can specify your own, or leave undefined to use the default one that goes to your platform's sound output). The object that is created is then a factory object that allows you to create all MinuteSynth modules.

Note that you may need to do this from within a click or other type of window interaction handler for the web browser to let you generate sound.

For an example of creating a MinuteSynth instance that records to a memory buffer, rather than going to the platform's sound output, see the `record8()` function in `support/recorder.js`.

## Module Factory Reference

Note that variables are *patchable* if not specified otherwise. That means they can be set to a constant number, set to an upstream module, later patched to an upstream module, or set/later patched to an array of uptream modules (to add upstream module outputs together). On the other hand, a number of parameters are labeled *non-patchable*. These are meant to be a constant value (or array of numbers where specified) that are set upon instantiation or explicitly assigned shortly after instantiation, and unchanged throughout the life of the module.

### ADSR (Attack, Decay, Sustain, Release)

`ADSR({ D: 0, b: 0, e: 1, a: 1e-3, d: 0, s: 1, r: 0, p: 0, x: false }, t$)`

This uses ADSR parameters to create a module that can allow the output value to ramp up and down as specified whenever the module is triggered. Use the `t$` (second parameter) to reverse-bind a trigger (e.g. from [Voice](#voice)).

ADSR parameters (see the [Intro docs](intro.md#adsr-controls) for a diagram that shows what each of these parameters means; they're all non-patchable, but can be altered prior to triggering):

| Parameter | Meaning | Default |
|-|-|-|
| `D` | Start delay (sec) | 0 |
| `b` | Base value (value of "off") | 0 |
| `e` | Attack maximum value | 1 |
| `a` | Attack time (sec) | 1e-3 |
| `d` | Decay (time to go from e to s) | 0 |
| `s` | Sustain value | 1 |
| `r` | Release time (time to go from s to b when triggerOff) | 0 |
| `p` | Auto-pulse (if nonzero, time to automatically triggerOff) | 0 |
| `x` | Disable "off" to allow auto-pulse to complete | false |

---

### Buf (Buffer)

`Buf({ T: 1, c: 1, S: 1, g: 1, s: -1, F: AudioContext.samplerate, r: 1, d, n: 0, L, p, P }, t$)`

Buffer represents a block of memory that specifies samples. Access the memory with `.mem()`; the length of the buffer is the returned buffer's `.length`. Direct edits to the memory can be immediately heard. If using frequency control, this module automatically refreshes the underlying WebAudio `AudioBufferSource` so that repeated playing is possible.

Params: `T:` duration (non-patchable); `c:` channels (non-patchable); `S:` scale; `g:` gain; `s:` start time (`-1` (default), `0`, and greater as in "Osc" module; non-patchable); `F:` sampling rate (defaults to system default, non-patchable); `r:` playback rate factor; `d:` detune; `n:` nominal playback frequency via the `.f` property (0 for no freq. control), `L:` enables looping if true, `p:` loop begin in seconds with respect to nominal frequency (default: 0), and `P:` loop end (default: end).

Pass in `t$` from a trigger source to trigger the buffer's playback.

Methods:

**`.mem(chan=0)`:** Returns an editable array that represents the sample buffer for the given channel. Generally, for "left" or "mono", `chan` should be `0`.

After instantiation, the `.s` property allows for on/off control with `.s.go(startTime)` and `.s.stop(startTime)` respectively. And, the `t$` reference will trigger the calling of `.on(onTime, freq)` and `.off(offTime)`.

---

### C (Constant)

`C(v=0)`

Constant provides a patchable value that can remain steady, or be altered through time. (That isn't so "constant" after all).

Param: `v:` value to serve out, whether it be a number or upstream patch

---

### Comp (Compressor) 

`Comp({ t, k, o, a, r, g=1, r$ })`

A classic compressor that can gracefully regulate the levels of a sound and prevent cliping (e.g. loud sounds that exceed the -1 to 1 sample amplitude limits). See [WebAudio docs](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode) for more information.

Params: `t:` threshold, `k:` knee, `o:` ratio, `a:` attack, `r:` release

---

### Conv (Convolver)

`Conv({ b, g=1, n=true, r$ })`

Convolver sets up a convolution using a kernel set up in a BufferNode object. `b: m$.reverb(...)` can be used for a simple reverb effect. See [WebAudio docs](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode) for more information.

Params: `b:` BufferNode (non-patchable object), `g:` gain, `n:` normalize (true by defualt, non-patchable value), `r$:` input

---

### Dist (Distorter)

`Dist({ a=50, F=m$.dw(a), g=1, r$ })`

Distort performs a wave-shaping operation, allowing for remapping of sampled wave amplitudes. See [WebAudio docs](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode) for more information.

Params: `F:` distort function (default: `m$.dw()`), `a:` function parameter (non-patchable), `r$:` input

---

### Filt (Filter)

`Filt({ t, q, f, S=1, b, g=1, r$ })`

Biquad filtering of sound using the filter type provided in `t`.

Params: `t:` type (non-patchable), `q:` Q value (or "width" of the filter), `f:` frequency, `S:` scale (non-patchable), `b:` boost, `g:` gain, `r$:` input

The `t` "type" parameter must take one of the following:
 
| Attribute | Index | WebAudio String |
|-|-|-|
| m$.F.LOWPASS | 1 | 'lowpass' |
| m$.F.HIGHPASS | 2 | 'highpass' |
| m$.F.BANDPASS | 3 | 'bandpass' |
| m$.F.LOWSHELF | 4 | 'lowshelf' |
| m$.F.HIGHSHELF | 5 | 'highshelf' |
| m$.F.PEAKING | 6 | 'peaking' |
| m$.F.NOTCH | 7 | 'notch' |
| m$.F.ALLPASS | 8 | 'allpass' |

---

### Frequency Controller

`Freq({ p=0, t$ })`

This is like a voltage control to attach to oscillators and other frequency inputs. It can be used to centrally manage a frequency and optionally has a glide (portamento) capability.

Use the `t$` (second parameter) to reverse-bind a trigger source, like [Voice](#voice).

Method:

**`.on(onTime, freq)`:** Sets desired frequency (in Hz) at the given time. Normally this would be called by having registered this to [Voice](#voice), and calling the Voice `.on()` method.

---

### Gain

`Gain({ g=1, r$ })`

Gain (or, amplifier) is a very simple module that acts as a multiplier.

Params: `g:` gain value; `r$:` input

---

### Noise

`Noise({ g=1, s=0, r, d })`

Noise produces a playable buffer of noise.

Params: `g:` gain; `s:` start time (non-patchable), `r:` playback rate factor, `d:` detune

---

### Osc (Oscillator)

**`Osc({ t, S=1, f, d=0, g=1, s=0, r=[], i=[], n=1 })`**

Oscillaor is a simple tone generator. Specify its type and also scale, which can transform the incoming base frequency when the module is triggered. Specify `r` and `i` arrays for periodic wave.

Params: `t:` type (non-patchable parameter); `S:` scale (non-patchable parameter); `f:` default frequency, or patch from another module that serves as frequency input; `d:` detune, `g:` gain; `s:` start time (non-patchable parameter)

More esoteric parameters: `r:` real values array; `i:` imag. values array, `n:` nominal playback frequncy (for custom waveform; non-patchable parameter)

The type `t:` parameter must take one of these values:

| Attribute | Index | WebAudio String |
|-|-|-|
| m$.W.SINE | 1 | 'sine' |
| m$.W.SQUARE | 2 | 'square' |
| m$.W.SAWTOOTH | 3 | 'sawtooth' |
| m$.W.TRIANGLE | 4 | 'triangle' |
| m$.W.CUSTOM | 5 | 'custom' |

The start `s:` parameter may take:

| Value | Meaning |
|-|-|
| `-1` | Defer starting; use `.s.go()` attribute to then start |
| `0` | Start immediately (default). Generally, one varies the gain `.g` attribute to control sound output. |
| Greater than 0 | Specific time with respect to `AudioContext.currentTime` to schedule starting |

After instantiation, the `.s` property allows for on/off control with `.s.go(startTime)` and `.s.stop(startTime)` respectively.

---

### Prog (Program)

`Prog({ t, v, p=0 })`

This orchestrates a series of values on a constant output that can be triggered.

Params (all non-patchable): `t:` timesteps (seconds from trigger) array, `v:` values array, `p:` portamento (glide) time in seconds

> **TODO:** Allow for repeats

---

### Pulse

`Pulse({ w=0.1, o=0, S=1, g=1, s=0, W=1024 })`

Pulse produces a pulse waveform of width w at offset o. Frequency-controlled through the `.f` property

Params: `w:` pulse width (0-1) (non-patchable); `o:` pulse offset (0-1) (non-patchable); `S:` scale; `g:` gain; `s:` start time (non-patchable), `W:` samples (non-patchable)

---

### Spec (Spectrum)

`Spec({ F, G, n=440, R=AudioContext.samplerate / 4, f, s=0, g=1, S=1 })`

This creates a complex oscillator waveform from a series of real frequencies. Gains are defaulted to 1 unless an array of gains is specified.

Params (all non-patchable): `F:` Array of frequencies, `G:` Array of gains (default: 1's), `n:` nominal frequency, `R:` sample size

There is also `g:` (patchable) for default gain, and `S:` (non-patchable) start time (which can be `-1`, `0`, and greater as documented in [Oscillator](#osc-oscillator))

---

### Voice

**`Voice({ g=0.5, v=true, p, r$ })`**

Represents a single channel of sound that is controlled by one main frequency.

The gain `g:` is the final "volume control" and its output is by default the AudioContext's destination. Set `v:` to false or 0 to disable attaching to the default AudioContext `ac.destination`. You can get the final WebAudio output from the `.z` attribute. An automatically generated [frequency controller](#frequency-controller) is available at `.f`. Use `p:` to enable and set the frequency portamento, if desired.

Methods:

**`.$(module)`:** This special forward-patch registers the given module with the `.rg()` method to receive trigger events.

**`.on(onTime, freq)`:** Calls `.on()` for all modules registered to receive triggering events. The `onTime` paramter will allow for time (with respect to `AudioContext.currentTime`) to be passed to registered modules' `.on()` methods; use `0` to specify current time. Also `freq` is the frequency in Hz to pass to member modules' `.on()` method.

**`.off(offTime)`:** Calls `.off()` for all modules registered for trigger events. Use `offTime` to pass a specific time (with respect to `AudioContext.currentTime`) to respective modules. Leave `offTime` undefined to use the current time.

**`.rg(...modules)`:** Registers one or more modules as triggerable. These will then be called when `.on()` or `.off()` are called. You can also register modules by patching them to Voice using `.$()`

---

### Special AudioNode Adaptor

**`ACN(N, r$)`**

ACN is a wrapper for an arbitrary AudioNode, to facilitate connection tracking and parameter manipulation offered through this framework.

Specify an instantiated AudioNode object in `N`, with optional ability for reverse-binding via `r$`.

---

### Others TODO

* Channel split
* Channel join
* Stereo pan
* Cross-fade

## Common Method Reference

### All Modules

**`.$(target)`:** Forward-patch: Patches the default output of the module this is called on to the default input of the `target` module or patchable parameter. Returns `target` to allow chaining.

**`.r$(source)`:** Reverse-patch: Acts in the reverse direction of the `.$()` method; allows for the default output of the `source` module or patchable parameter to be patched to the default input of this module or patchable parameter. Return self to allow chaining. In addition:

* When called with an array as a parameter, all patches or values in the array are added together.
* When called repeatedly or chained, all patches or values are added together.
* Direct numbers may be specified to patch a constant value. They'll automatically be wrapped in a `m$.C` module.

**`.detach(tgtModule, paramName)`:** Explicitly disconnects the underlying AudioNode objects. It will stop sound, and it will also facilitate garbage collection of WebAudio objects. If parameters aren't specified, then the notion of "ALL" is assumed.

**`.z` Attribute:** Directly references the underlying WebAudio AudioNode that drives the main audio output for the module. Note that connections made directly to or from this attribute are not tracked within this framework, as they would otherwise be with `.$()` and `.r$()`.

### Patchable Parameter Objects

**`.name`:** String name representation for the parameter

**`.obj`:** Direct reference to the destination WebAudio AudioNode or AudioParam object

**`.r$(source)`:** Reverse-patch: Same operation as `.r$()` for modules.

**See Also** the "Lower Level Controls" section of the [Intro](intro.md#lower-level-controls) Document for the time-dependent value-setting methods.

## Additional Utility Methods

The MinuteSynth `$m` object also contains a couple of extra methods that are used for specific purposes:

**`.now()`:** Current AudioContext time: Returns the current time for the AudioContext; useful for time-dependent operations that require a time to be speficied.

**`.reverb(fadeInTime, decayTime, subsample, numChan = 2)`:** Create Simple Reverb convolution kernel: This is used to create a kernel that can be fed into the `m$.Conv` module. Borrowed from: https://github.com/adelespinasse/reverbGen/blob/master/reverbgen.js

* **fadeInTime:** Number of seconds to allow reverb to fade in
* **decayTime:** Similar for the length of the reverberation
* **subsample:** Another parameter that you'll need to play with. Example: `0.95`
* **numChan:** Number of audio channels to render. If this is `2`, then it can result in a "chorus" stereo effect.

**`.dw(amount = 50, W = 8192)`:** Sample distortion effect, borrowed from https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
