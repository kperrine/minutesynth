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

For an example of creating a MinuteSynth instance that records to a memory buffer, rather than going to the platform's sound output, see the `record8()` function in `support/recorder.js`.

## Module Factory Reference

*


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
* **numChan:** Number of audio channels to render. If this is 2, then it can result in a "chorus" stereo effect.

**`.dw(amount = 50, W = 8192)`:** Sample distortion effect, borrowed from https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion

## Helper Functions

When `minutesynth.js` is included into HTML, a couple of global helper functions are created.

**`$A(source, target)`:** Assign: Copies contents of `source` to `target` and returns result. It is used to allow shorthand late-binding self-references from within objects by calling `Object.assign()`.

**`$R(range = 2, lowest = -1)`:** Random: Returns a random number in [*lowest*, *lowest* + *range*], by default in [-1, 1].

**`$Y(inputs, function)`:** Apply: Calls the given function *function* on the input *input* or each element of *input* if an array is given.
