# USynth Documentation

Preliminary

## Modules

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
