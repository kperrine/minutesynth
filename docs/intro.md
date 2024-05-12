# MintueSynth Intro

As in the README...

This is a small-scale front-end for working with the WebAudio library found in modern web browsers. The motivation for creating this was to leverage the powerful features of WebAudio in a form that was somewhat more compact than WebAudio itself could offer. It was used by Neurolyte in a couple of 64K JavaScript demo projects. The pluggable design was helpful for tinkering with sounds at the barest minimum of overhead. The library's terseness helped in whipping up code quickly and estimating final code size. After minifying, it was remarkably small.

## Modules

MinuteSynth is comprised of a number of modules that have a common interface for snapping them together. This is the general pattern seen in modules:



## Semantics

Most of the modules follow these patterns:

* A module is created by calling a module name with a set of parameters:
  ```javascript
  // Create a sinewave with a fixed frequency of 600 Hz
  let myOscillator = M$.Osc({ M$.sine, f: 600 })
  ```
* Patches between upstream and downstream modules can be made:
  * Forward patch: `.$()` method
  * Reverse patch `.r$()` method, and also `r$` parameter upon instanciation.
  ```javascript
  source.$(destination) // <-- Forward patch
  destination.r$(source) // <-- Reverse patch

  // And, reverse-patch-upon-instanciation example:
  let filter = M$.Filt({ t: M$.lowpass, q: 10, f: 300, r$: source })
  ```
* There's often a built-in gain node that's controlled with the `g` parameter set to 1 by default:
  ```javascript
  // Approach #1: Set gain to a constant half upon instanciation:
  let myOscillator = M$(Osc({ t: M$.sine, f: 600, g: 1/2 }))
  // Approach #2: Set once after instanciation:
  let myOscillator = M$.Osc({ t: M$.sine, f: 600 })
  myOscillator.g.r$(1/2)
  // Approach #3: Set at specific time using vC()... see further below:
  myOscillator.g.vC(1/2)
  ```
* Multiple patches added together can be made by putting multiple parameters into an `[]` array.
  ```javascript
  let sinewave = M$.Osc({ t: M$.sine, f: 600 }),
      squarewave = M$.Osc({ t: M$.square, f: 400 })
  voice.r$([sinewave, squarewave])
  ```
* Most parameters can take a constant scalar as an input, a module as an input, or an array. If you want to have a scalar in an array, you'll need to create a `M$.C` (Constant) object for it.
  ```javascript
  // Example 1: Set the gain to a constant scalar:
  let sinewave = M$.Osc({t: 'sine', f: 600, g: 1/2})
  // Example 2: Set the gain to s 30Hz sinewave coming from a module:
  let sinewave = M$.Osc({t: 'sine', f: 600, g: M$.Osc({t: 'sine', f: 30})})
  // Example 3: both:
  let sinewave = M$.Osc({t: 'sine', f: 600, g: [M$.Osc({t: 'sine', f: 30}), M$.C(1/2)]})
  // Example 3b: Set the final gain to be positive by scaling the 30 Hz
  // sinewave to 1/2 and biasing by adding a constant 1/2 to that:
  let sinewave = M$.Osc({t: 'sine', f: 600, g: [M$.Osc({t: 'sine', f: 30, g: 1/2}), M$.C(1/2)]})
  // Example 3c: A clearer way to write that:
  let tremolo = M$.Osc({t: 'sine', f: 30, g: 1/2})
  let sinewave = M$.Osc({t: 'sine', f: 600, g: [tremolo, M$.C(1/2)]})
  ```
* All of these parameters can be set to have dynamically varying scalar values as input. If these parameters already have modules set as inputs, then the scalars are added as offsets to those existing inputs.
  ```javascript
  let signal = M$.C(1),
      sinewave = M$.Osc({t: 'sine', f: 100, g: 1/4}),
      biasedGain = M$.Gain({g: sinewave, r$: signal});
  biasedGain.g.r$(M$.C(1/2));
  // biasedGain will vary between 1/4 and 3/4.
  // Note also this would produce the same effect:
  biasedGain = M$.Gain({g: [sinewave, M$.C(1/2)], r$: signal});
  ```
* The "type" parameter `.t` on Oscillators and Filters (`M$.Osc` and `M$.Filt`) can either take the string literal, or be substituted with a number that maps into a lookup table found in the MinuteSynth code. See the [Cheat Sheet](cheatsheet.md) for more info.
  ```javascript
  // String:
  let sinewave = M$.Osc({t: 'sine', f: 100, g: 1/4})
  // Shorthand number:
  let sinewave = M$.Osc({t: 1, f: 100, g: 1/4})
  ```

Other esoteric details:

* Outs are usually emerging from a gain AudioNode, and are accessible by the `.z` property if need be.

## The Voice Module

The `M$.Voice` module is a special module that represents the connection to the final output, which by default is the web browser's sound output. A couple extra features allow for default frequency control, and triggering of modules on/off.

First, this would allow for a sound to be emitted indefinitely. Also, utilize the voice's built-in frequency controller to control the oscillator.

```javascript
let voice = M$.Voice({g: 1/4, f: 600}) // Make the voice quarter-gain
let sinewave = M$.Osc({t: 'sine', f: voice.f})
voice.r$(sinewave)
```

Next, if we wanted to delay the voice, we can utilize the current time record for the synthesizer and set events relative to that time.

```javascript
let now = M$.now()
voice.off(now)
voice.on(now + 1, 600) // Delay sound start in 1 second with freq. controller at 600 Hz
voice.off(now + 2) // Then shut it off 1 second after that
```

Any module that cares to respond to these on and off events (e.g. those that have `on()` and `off()` methods, including `M$.ADSR`) can be patched to Voice using `Voice.$()`.

## Time-Dependent Controls on Modules

### Start/Stop

Controlling sound on/off at the voice level may be crude. It may be advantageous to be able to control when individual oscillators start and stop. Let's look at this example:

```javascript
let voice = M$.Voice({g: 1/4, f: 600})
let osc1 = M$.Osc({t: 1, f: voice.f, s: -1})
let osc2 = M$.Osc({t: 1, f: [voice.f, M$.C(-20)], s: -1}) // Detune 20 Hz lower
voice.r$([osc1, osc2])
```

When we make the oscillators in this example, we set the "start time" `s:` parameter to `-1` which means "defer starting". We can then add in this fine-tuned control for switching the oscillators on and off:

```javascript
let now = M$.now()
osc1.s.go(now + 1)
osc1.s.no(now + 3)
osc2.s.go(now + 2)
osc2.s.no(now + 4)
```

This causes osc1 to go after a 1-second delay, osc2 to start a second after that, and for each oscillator to stay on for 2 seconds.

### ADSR Controls

Rather than manipulating the oscillators for on/off control, it is also possible to linearly control the gain nodes that are bundled with each oscillator. One model commonly used to change controls is "ADSR", or "Attack, Decay, Sustain, Release". The ADSR control has a series of parameters, illustrated in this figure:

![ADSR illustration](img/adsr_curve.png)

| Varibale | Meaning | Default |
|-|-|-|
| D | Start delay (sec) | 0 |
| b | Base value (value of "off") | 0 |
| e | Attack maximum value | 1 |
| a | Attack time (sec) | 1e-3 |
| d | Decay (time to go from e to s) | 0 |
| s | Sustain value | 1 |
| r | Release time (time to go from s to b when triggerOff) | 0 |
| p | Auto-pulse (if nonzero, time to automatically triggerOff) | 0 |

> **Trick:** It is possible to invert the ADSR curve by setting b > e or b > s.

### Lower Level Controls

The WebAudio value controls are also made available. This is an example of using:

```javascript
osc1.g.vT(1, now + 1)
osc1.g.lT(0, now + 3) // Linearly go from 1 to 0 in 2 sec.
osc2.g.vT(1, now + 2)
osc2.g.lT(0, now + 4) // Same
```

Controls include:

| Method(Params) | Description |
|-|-|
| `vC(value)` | Set constant value for all time |
| `vT(value, startTime)` | Set value at scheduled time |
| `lT(value, endTime)` | Linear ramp to value at end time |
| `eT(value, endTime)` | Exponental ramp to value at end time (0 is valid) |
| `t(value, startTime, tc)` | Start nonlinear glide to value using given time constant (e.g. 1/3 gets 95% toward value over 1 sec.) |
| `cv(values, startTime, dur)` | Calls WebAudio AudioParam setValueCurveAtTime() method
| `c(startTime)` | Cancels scheduled events after the given time |
| `h(holdTime)` | Cancels scheduled events after the given time, and holds the value constant at that time |
| `z0()` | Sets value to 0 |

These types of controls are available for most scalar parameters in MinuteSynth, including `M$.C` constants.






## Examples:




## Semantics



Most modules are created with a gain AudioNode built in. The gain amount can be set with the `.g` parameter, and is set to 1 by default.

The output of each module, which is usually a gain AudioNode, is accessible by the `.z` property.

The main audio input of a module is accessible with the `.in` property, but when patching, you just need to use the module name itself.

Most parameters (those set up with the `._addParam` method internally) can take a scalar as an input, a module as an input, or an array. An array will add all of the inputs together. If you want to have a scalar in an array, you'll need to create a `U.C` object for it.

```javascript
U.G({g: 0.7}) // Multiplies the input by 0.7
U.G({g: U.O({t: 'sine', f: 2, g: 0.8})}) // Oscillates multiplier from -0.8 to 0.8 at 2 Hz
U.G({g: [U.C(0.7), U.O({t: 1, f: 2, g: 0.8}])}) // Oscillates from -0.1 to 1.5 at 2 Hz. 
```

All of these parameters can be set to have dynamically varying scalar values as input through the methods offered by the `_ParamValue` object. If these parameters already have modules set as inputs, then the scalars are added as offsets to those existing inputs.

The "type" parameter `.t` on Oscillators and Filters (`O` and `Q`) can either take the string literal, or be substituted with a number that maps into a lookup table found in the USynth code.

To "patch in" one module to another, you can do this with the "bind" `.$()` or "reverse bind" `.r$()` methods:

```javascript
source.$(destination)
destination.r$(source)
```

For multiples:

```javascript
source.$(destination1).$(destination2)
destination.r$([source1, source2]) // Adds source1 and source2 together.
```

Most module declarations take a "reverse bind" `r$` parameter for ease of connecting modules together.

Oscillators, Noise, and Buffer (`O`, `N`, and `B`) have a scalar "start" parameter `s` that tells the respective AudioNode objects to start at specific times. If `s` is undefined, then the start happens immediately. If it is -1, then they won't start until the `.go()` method is called. (TODO: Could make them go if triggered).

If Oscillators, etc. are told to start, they'll be generating sound. The sound will be heard unless a gain parameter somewhere in the pipeline shuts the sound off until a trigger happens (e.g. through an ADSR connected to a gain module).

The Distorter `U.D` module takes an `a` parameter for "amount". It can range from -2.9 to 100 or beyond. Values below 0 map to an exponential curve where low audio values are quieted, and values above 0 map to a sigmoid where low audio values are amplified.

## The Voice Module

The Voice module automatically connects to the AudioContext's destination, and contains a frequency controller (accessible through `.f`, and distributes triggered when its `.on()` and `.off()`) methods are called. It also has a gain AudioNode that can control the volume for everything that is output.

## ADSR Basics

The ADSR (`U.A({}, voice)`) takes attack/decay/sustain/release values for use of automatically controlling an input parameter over time. It is important to attach the "voice" object to it, as that will allow the ADSR to be triggered by the "voice".

The default ADSR lets the tone stay on until it is shut off. These are the values that can be set:

* D: start delay for attack
* b: base value (= "off" value)
* e: attack arrival value
* a: attack time (time to go from b to e)
* d: decay time (time to go from e to s)
* s: sustain value (after the attack-decay sequence
* r: release time (from s to b, occurring when off() is called)
* p: auto-pulse-- if nonzero, automatically does an off() p seconds after on().



If you want to route the output of a MinuteSynth module to a WebAudio node input, you can use the `connect()` method on the module's output:

```javascript
// Let's say we have an "analyser" object from WebAudio.
let myOscillator = M$.Osc({t: 'sine', f: 30})
myOscillator.z.connect(analyser)
```

## Timing

In addition to ADSR:

.eV, etc.


## Triggers

.go
.no
t$