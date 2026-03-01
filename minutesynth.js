"use strict";

// Universal audio cotext reference:

// ACX is a reference to the AudioContext class, for creating AudioContext objects.
var ACX = window.AudioContext || window.webkitAudioContext

class MinuteSynth {
  // Represents Attack, Decay, Sustain, Release parameterized curve.
  // The default ADSR parameters lets the tone stay on until it is shut off.
  static ADSRParams = class {
    /**
     * Creates an ADSR (Attack, Decay, Sustain, Release) parameterization
     * @param {number | undefined} D - start delay for attack
     * @param {number | undefined} b - base value (= "off" value)
     * @param {number | undefined} e - attack arrival value
     * @param {number | undefined} a - attack time (time to go from b to e)
     * @param {number | undefined} d - decay time (time to go from e to s)
     * @param {number | undefined} s - sustain value (after the attack-decay sequence
     * @param {number | undefined} r - release time (from s to b, occurring when triggerOff() is called)
     * @param {number | undefined} p - auto-pulse-- if nonzero, automatically does a triggerOff p seconds after triggerOn.
     */     
    constructor({ D = 0, b = 0, e = 1, a = 1e-3, d = 0, s = 1, r = 0, p = 0 } = {}) {
      Object.assign(this, { D, b, e, a, d, s, r, p })
    }
  }

  static _DEFAULT_ADSR = new MinuteSynth.ADSRParams()

  /**
   * Sample rate that is provided by the AudioContext. By default, it is 44100 Hz.
   * @type {number}
   * @readonly
   */
  sampleRate

  /**
   * AudioContext object that is to be used to produce WebAudio objects.
   * @type {AudioContext}
   * @readonly
   */
  audioContext

  /**
   * Length of noise sample in seconds. Equates to seconds * sampleRate samples.
   * @type {number}
   */
  NOISE_LEN = 1.0

  /**
   * Constructs a MinuteSynth instance tied to the given AudioContext.
   * @param {AudioContext | undefined} ac - The AudioContext to use (default: new AudioContext()).
   */
  constructor(ac = new ACX()) {
    this.audioContext = ac
    this.sampleRate = ac.sampleRate
  }

  /**
   * Base return type for MinuteSynth modules that expose a series of patchable
   * parameters
   */
  SynthModule = (parent => class SynthModule {
    /**
     * minuteSynth is a reference to the parent MinuteSynth instance
     * @type {MinuteSynth}
     */
    minuteSynth = parent

    /**
     * collection of parameters for this module
     * @type {Object.<string, Param>}
     */
    _params

    /**
     * outParams is a list of parameters that this module is attached to
     * @type {Param[]}
     */
    _outParams

    constructor() {
      this._params = {}
      this._outParams = []
    }

    /** Represents a parameter that allows for attachment to another module or constant as input */
    Param = (parent => class Param {
      /** @type {SynthModule[]} */
      _inModules

      /** @type {SynthModule} */
      synthModule = parent

      /**
       * Cretes a parameter that allows for attachment to another module
       * @param {string} name
       * @param {AudioParam} obj
       * @param {number | string} defVal 
       */
      constructor(name, obj, defVal) {
        this._name = name
        this._obj = obj
        this._defVal = defVal
        this._inModules = []
        // TODO: Call _addParam() from here because we have our SynthModule reference.
      }

      /**
       * "Reverse attach:" Attach a source module to this parameter. If it is a Voice,
       * then register the voice.
       * @param {number | SynthModule | [] | undefined} srcModules
       * @return {Param} The current parameter object, to allow for chaining.
       */  
      r$(srcModules) {
        for (let module of [].concat(srcModules)) {
          if (!isNaN(module)) {
            module = this.synthModule.minuteSynth.C(module)
          }
          this._inModules.push(module)
          if (module._$(this._obj)) {
            this.z0 && this.z0()
          }
        }
        return this
      }

      /**
       * Remove an incoming connection by incoming module reference, or all if no parameter specified
       * @param {SynthModule | undefined} inModule 
       */
      detach(inModule) {
        for (let module of [...this._inModules]) { // Iterate over copy
          if (!inModule || (module === inModule)) {
            [].concat(this._obj).forEach(obj => {
              try {
                module.z.disconnect(obj)
              } catch (_) {}})
            inModule && this._inModules.splice(this._inModules.indexOf(inModule), 1)
          }
        }
      }
    })(this)

    ParamValue = class extends this.Param {
      /**
       * Cretes a parameter that represents a time-varying value
       * @param {string} name 
       * @param {AudioParam} obj
       * @param {number | string} defVal 
       */
      constructor(name, obj, defVal) {
        super(name, obj, defVal)
      }

      vC(value) {
        this._obj.value = value
      }

      vT(value, startTime) {
        this._obj.setValueAtTime(value, startTime)
      }

      lT(value, endTime) {
        this._obj.linearRampToValueAtTime(value, endTime)
      }

      eT(value, endTime) {
        this._obj.exponentialRampToValueAtTime((Math.abs(value) < 1e-4) ? 1e-4 : value, endTime)
      }

      t(value, startTime, tc) { // tc: Use 1/3 for 95% over 1 sec.
        this._obj.setTargetAtTime(value, startTime, tc)
      }
      
      cv(values, startTime, dur) {
        this._obj.setValueCurveAtTime(values, startTime, dur)
      }
      
      c(startTime) {
        this._obj.cancelScheduledValues(startTime)
      }

      h(holdTime) {
        this._obj.cancelAndHoldAtTime(holdTime)
      }

      z0() {
        this.vC(0)
      }
    }

    ParamAudio = class extends this.Param {
      /**
       * Cretes a parameter that represents an audio input
       * @param {AudioParam} obj
       * @param {number | string} defVal 
       * @param {string | undefined} paramName 
       */
      constructor(obj, defVal, paramName = 'in') {
        super(paramName, obj, defVal)
      }

      z0() {
        this._obj.value = 0
      }
    }

    // ParamStart allows access to the start/stop methods, exposed as 's'. Set startTime to:
    // -1 to defer starting, 0 to autostart now, and other to start at specified time.
    ParamStart = class extends this.Param {
      /**
       * Cretes a parameter that allows for start/stop control
       * @param {AudioParam} obj
       * @param {number} startTime - -1 to defer, 0 to autostart now, and other to start at specified time.
       * @param {number | undefined} defVal 
       */
      constructor(obj, startTime) {
        super('s', obj)
        this._startTime = startTime
        if (startTime != -1) {
          this.go(startTime)
        }
      }

      /**
       * Start at the specified time, or immediately if startTime is 0 or not provided
       * @param {number | undefined} startTime 
       */
      go(startTime = 0) {
        this._obj.start((startTime == 0) ? this.synthModule.minuteSynth.now() : startTime)
      }

      /**
       * Stop at the specified time, or immediately if stopTime is 0 or not provided
       * @param {number | undefined} stopTime 
       */
      stop(stopTime = 0) {
        this._obj.stop((stopTime == 0) ? this.synthModule.minuteSynth.now() : stopTime)
        // TODO: Consider scheduling an object detach() at stopTime
      }
    }

    /**
     * Attaches this module to a parameter (or main input) of a downstream module. tgtThing can either be
     * a Module or a Param.
     * @param {SynthModule | Param} tgtThing 
     * @param {string | undefined} tgtParamName - Optional parameter name to attach to if tgtThing is a module. Defaults to "in".
     * @returns {SynthModule} The target module, to allow for chaining.
     */
    $(tgtThing, tgtParamName) {
      // TODO: Add option to inherit parameters from target, if target is a module. Don't copy "in", and
      // if param exists in this, add index to it, e.g. "g2". That would allow for easier manipulation
      // of params from one location.
      if (tgtThing instanceof AudioNode) {
        tgtThing = this.minuteSynth.ACN(tgtThing)
      }
      // TODO: Allow "tgtThing" to be an array if multiple forward patches need to be made.
      let param = tgtThing
      if (tgtThing._params) {
        param = tgtThing._params[tgtParamName || 'in']
      }
      param.r$(this)
      this._outParams.push(param)
      return tgtThing // Allows chaining of commands
    }

    /**
     * A "reverse attach", which will allow one or more source modules to attach to this module
     * @param {number | SynthModule | [] | undefined} srcModules - The source module(s) to attach.
     * @param {string | undefined} thisParamName - Parameter name to attach to if this module has multiple parameters. Defaults to "in".
     */
    r$(srcModules, thisParamName) {
      [].concat(srcModules).forEach(module => {
        if (!isNaN(module)) {
          // If the source module is a number, then wrap it in a "C" module:
          module = this.minuteSynth.C(module)
        }
        module.$(this, thisParamName)
      })
      return this
    }

    /**
     * "internal attach" that used to facilitate underlying output AudioNode to parameter
     * connection. Return a nonzero to automatically remove values from input.
     * @param {AudioNode} targetObj
     */
    _$(targetObj) {
      try {
        this.z.connect(targetObj)
      } catch (_) {}
      return 1
    }

    /**
     * Removes an outgoing connection by target module reference, parameter name, or both.
     * If no parameters are specified, then all outgoing connections are removed.
     * @param {SynthModule | null | undefined} tgtModule 
     * @param {string | null | undefined} paramName 
     */
    detach(tgtModule, paramName) {
      for (let param of [...this._outParams]) {
        if (!tgtModule || (param.synthModule === tgtModule)) {
          if (!paramName || (param._name === paramName)) {
            param.detach(this)
            this._outParams.splice(this._outParams.indexOf(param), 1)
          }
        }
      }
    }

    /**
     * Associates the given parameter with this module, making it accessible by name
     * @param {Param} param
     * @return {Param} The parameter that was added, to allow for chaining
     */
    // TODO: Investigate whether we can call this from Param constructor...
    _addParam(param) {
      this._params[param._name] = param
      this[param._name] = param
      if (!isNaN(param._defVal)) {
        // Assign number:
        param.vC(param._defVal)
      }
      else if (param._defVal) {
        // Assign module(s):
        [].concat(param._defVal).forEach(element => element.$(param))
      }
      return param
    }

    /**
     * Boilerplate for a frequency-based parameter setup
     * @param {AudioNode} control 
     * @param {number | undefined} defFreq 
     */
    _addFreqHelper(control, defFreq = 0) {
      control.value = 0
      this._S = this.minuteSynth.Gain()
      if (!isNaN(defFreq)) {
        // If the default value is a number, then create a constant for it:
        this._C = this.minuteSynth.C(defFreq)
        // TODO: Inherit the parameters rather than recreating.
        this._addParam(new this.ParamValue('f', this._C.z.offset, defFreq))
        this._C.$(this._S)
      }
      else {
        // TODO: Inherit the parameters rather than recreating.
        this._addParam(new this.ParamValue('f', this._S.z, defFreq))
      }
      this._addParam(new this.ParamValue('S', this._S.z.gain, this._calcSCRate(1)))
      this._S.z.connect(control)
    }
  })(this)

  BaseAmp = class extends this.SynthModule {
    /**
     * Establishes a base module with a gain node for controlling output level (default unity gain)
     * @param {number | undefined} gainVal - Default gain, including negative values to flip the waveform
     */
    constructor(gainVal = 1) {
      super()
      this.z = this.minuteSynth.audioContext.createGain()
      this._addParam(new this.ParamValue('g', this.z.gain, gainVal))
    }
  }

  /**
   * Convenience/clarity constants for Osc t: type
   */
  WaveType = Object.freeze({
    SINE: 1,
    SQUARE: 2,
    SAWTOOTH: 3,
    TRIANGE: 4,
    CUSTOM: 5
  })

  /**
   * Osc (Oscillaor) is a simple tone generator. Specify its type and also
   * scale, which can transform the incoming base frequency when the module is
   * triggered. Specify r and i arrays for periodic wave.
   * @param {number | string} t - Type of waveform, can use WaveType lookup
   * @param {number | undefined} S - scale (default: 1)
   * @param {number | SynthModule | []} f - default frequency
   * @param {number | SynthModule | [] | undefined} d - detune (default: 0)
   * @param {number | SynthModule | [] | undefined} g - gain (default: 1)
   * @param {number | undefined} s - start time (default: 0)
   * @param {Float32Array | undefined} r - real values
   * @param {Float32Array | undefined} i - imag. values
   * @param {number | undefined} n - nominal playback frequncy (for custom waveform)
   * @returns {SynthModule} An instance of an oscillator module
   */
  Osc({ t, S = 1, f, d, g = 1, s = 0, r, i, n = 1 }) {
    const Module = class Osc extends this.BaseAmp {
      o = this.minuteSynth.audioContext.createOscillator()
      _calcSCRate = freq => freq * S / n

      constructor() {
        super(g)
        if (t) {
          this.o.type = isNaN(t) ? t : ['sine', 'square', 'sawtooth', 'triangle', 'custom'][t - 1]
        }
        if (r) {
          this.o.setPeriodicWave(this.minuteSynth.audioContext.createPeriodicWave(r, i))
        }
        this._addParam(new this.ParamStart(this.o, s))
        this._addParam(new this.ParamValue('d', this.o.detune, d))
        this._addFreqHelper(this.o.frequency, f)
        this.o.connect(this.z)
      }
    }
    return new Module()
  }

  /**
   * Buf (Buffer) represents a block of memory that specifies samples. Access the memory with x();
   * the length of the buffer is length. Call L() to lock in the memory so that the buffer can be used.
   * @param {number | undefined} T - duration of the buffer in seconds (default: 1)
   * @param {number | undefined} c - number of channels (default: 1)
   * @param {number | undefined} S - scale (default: 1)
   * @param {number | SynthModule | [] | undefined} g - gain (default: 1)
   * @param {number | undefined} s - start time (default: 0)
   * @param {number | undefined} F - sampling rate (default: AudioContext's sample rate)
   * @param {number | SynthModule | [] | undefined} r - playback rate (default: 1)
   * @param {number | SynthModule | [] | undefined} d - detune (default: 0)
   * @param {number | SynthModule | [] | undefined} n - nominal playback frequency (0 for no freq. control)
   * @returns {SynthModule} An instance of a buffer module
   */
  Buf({ T = 1, c = 1, S = 1, g = 1, s = 0, F = this.audioContext.sampleRate, r = 1, d, n = 0 }) {
    const Module = class Buf extends this.BaseAmp {
      b = this.minuteSynth.audioContext.createBuffer(c, ~~(F * T), F)
      B = this.minuteSynth.audioContext.createBufferSource()
      T = T
      F = F
      N = ~~(F * T)
      _calcSCRate = freq => freq * S * T

      constructor() {
        super(g)
        this._addParam(new this.ParamStart(this.B, s))
        this._addParam(new this.ParamValue('d', this.B.detune, d))
        if (n) {
          this._addFreqHelper(this.B.playbackRate, n)
        }
        else {
          this._addParam(new this.ParamValue('r', this.B.playbackRate, r))
        }
        this.B.connect(this.z)
        // TODO: n isn't used except for determing if we are frequency controlled.
      }

      /**
       * Exposes the buffer for specified channel
       * @param {number | undefined} chan - Channel number (default: 0)
       * @returns {Float32Array} The channel data
       */
      mem(chan = 0) {
        return this.b.getChannelData(chan)
      }

      /**
       * Commits all channels of the exposed buffer, with optional ability to specify looping.
       * @param {boolean} loop - Whether to loop the buffer when played (default: true) 
       */
      lock(loop = true) {
        this.B.buffer = this.b
        this.B.loop = loop
      }
    }      
    return new Module()
  }

  /**
   * Noise produces a playable buffer of noise.
   * @param {number | SynthModule | [] | undefined} g - gain (default: 1)
   * @param {number | undefined} s - start time (default: 0)
   * @param {number | SynthModule | [] | undefined} r - playback rate (default: 1)
   * @param {number | SynthModule | [] | undefined} d - detune (default: 0)
   * @returns {SynthModule} An instance of a noise module
   */
  Noise({ g = 1, s = 0, r, d } = {}) {
    const module = this.Buf({ T: this.NOISE_LEN, g, s, r, d, n: 0 })
    const data = module.mem()
    for (let i = 0; i < module.N; i++) {
      data[i] = Math.random() * 2 - 1
    }
    module.lock()
    return module
  }

  /**
   * Pulse produces a pulse waveform of width w at offset o.
   * @param {number | undefined} w - pulse width (0-1); default: 0.1
   * @param {number | undefined} o - pulse offset (0-1); default: 0
   * @param {number | undefined} S - scale; default: 1
   * @param {number | undefined} f - default frequency; default: 440
   * @param {number | SynthModule | [] | undefined} g - gain; default: 1
   * @param {number | undefined} s - start time; default: 0
   * @param {number | undefined} W - samples; default: 1024
   * @returns {SynthModule} An instance of a pulse module
   */
  Pulse({ w = 0.1, o = 0, S = 1, f, g = 1, s = 0, W = 1024 } = {}) {
    // TODO: We could be cool and make a frequency domain waveform instead.
    const module = this.Buf({ T: W / this.audioContext.sampleRate, S, f, g, s, n: 1 })
    const data = module.mem()
    const bias = 0.5 - w
    for (let i in data) {
      data[i] = bias + ((((i - module.N * o) % module.N) / module.N <= w) ? 0.5 : -0.5)
    }
    module.lock()
    return module
  }

  /**
   * Dist (Distort) performs a wave-shaping operation, allowing for remapping of sampled wave amplitudes
   * @param {function(any): number[] | undefined} F - distort function (default: this.dw())
   * @param {number | undefined} a - default function parameter (default: 50)
   * @param {number | SynthModule | [] | undefined} g - gain (default: 1)
   * @param {number | SynthModule | [] | undefined} r$ - reverse-attach input
   * @return {SynthModule} An instance of a distortion module
   */
  Dist({ a = 50, F = () => this.dw(a), g = 1, r$ }) {
    // TODO: Input param: y?
    const module = class Dist extends this.BaseAmp {
      w = this.minuteSynth.audioContext.createWaveShaper()
      constructor() {
        super(g)
        this.w.curve = F()
        this.w.oversample = '4x'
        this._addParam(new this.ParamAudio(this.w, r$))
        this.w.connect(this.z)
      }
    }
    return new module()
  }

  /**
   * Convenience/clarity constants for Filt t: type
   */
  FilterType = Object.freeze({
    LOWPASS: 1,
    HIGHPASS: 2,
    BANDPASS: 3,
    LOWSHELF: 4,
    HIGHSHELF: 5,
    PEAKING: 6,
    NOTCH: 7,
    ALLPASS: 8
  })

  /**
   * Filt (Filter) allows for filtering of sound using the filter type provided in t.
   * @param {number | string} t - Type of filter, can use FilterType lookup
   * @param {number | SynthModule | []} q - Q value
   * @param {number | SynthModule | []} f - frequency
   * @param {number | undefined} S - scale (default: 1)
   * @param {number | SynthModule | [] | undefined} b - boost
   * @param {number | SynthModule | [] | undefined} g - gain (default: 1)
   * @param {SynthModule | [] | undefined} r$ - reverse-attach input
   * @returns {SynthModule} An instance of a filter module
   */
  Filt({ t, q, f, S = 1, b, g = 1, r$ }) {
    const module = class Filt extends this.BaseAmp {
      q = this.minuteSynth.audioContext.createBiquadFilter()
      _calcSCRate = freq => freq * S
      constructor() {
        super(g)
        this.q.type = isNaN(t) ? t : ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'][t - 1]
        this._addParam(new this.ParamAudio(this.q, r$))
        this._addParam(new this.ParamValue('Q', this.q.Q, q))
        this._addParam(new this.ParamValue('b', this.q.gain, b))
        this._addFreqHelper(this.q.frequency, f)
        this.q.connect(this.z)
      }
    }
    return new module()
  }

  /**
   * Conv (Convolver) sets up a convolution. A BufferNode object shall carry the convolution operation.
   * Use b: MinuteSynth.reverb() for a simple reverb effect.
   * @param {AudioBuffer} b - AudioBuffer containing the impulse response
   * @param {number | SynthModule | [] | undefined} g - Gain (default: 1)
   * @param {boolean | undefined} n - Normalize (default: true)
   * @param {number | SynthModule | [] | undefined} r$ - Reverse-attach input
   * @returns {SynthModule} An instance of a convolver module
   */
  Conv({ b, g = 1, n = true, r$ }) {
    const Module = class Conv extends this.BaseAmp {
      c = this.minuteSynth.audioContext.createConvolver()
      b = b

      constructor() {
        super(g)
        this.c.normalize = n
        this.c.buffer = this.b
        this._addParam(new this.ParamAudio(this.c, r$))
        this.c.connect(this.z)
      }
    }
    return new Module()
  }

  /** 
   * Comp (Compressor) 
   * @param {number | SynthModule | []} t - threshold
   * @param {number | SynthModule | []} k - knee
   * @param {number | SynthModule | []} o - ratio
   * @param {number | SynthModule | []} a - attack
   * @param {number | SynthModule | []} r - release
   * @param {number | SynthModule | [] | undefined} g - gain (default: 1)
   * @param {number | SynthModule | [] | undefined} r$ - reverse-attach input
   * @return {SynthModule} An instance of a compressor module
   */
  Comp ({ t, k, o, a, r, g=1, r$ }={}) {
    const module = class Comp extends this.BaseAmp {
      R = this.minuteSynth.audioContext.createDynamicsCompressor()
      constructor() {
        super(g)
        this._addParam(new this.ParamAudio(this.R, r$))
        this._addParam(new this.ParamValue('t', this.R.threshold, t))
        this._addParam(new this.ParamValue('k', this.R.knee, k))
        this._addParam(new this.ParamValue('o', this.R.ratio, o))
        this._addParam(new this.ParamValue('a', this.R.attack, a))
        this._addParam(new this.ParamValue('r', this.R.release, r))
        this.R.connect(this.z)
      }
    }
    return new module()
  }

  /**
   * C (Constant) provides a steady value that can also be manipulated through the 'v' Param.
   * @param {number | SynthModule | [] | undefined} v - The initial value of the constant (default: 0).
   * @return {SynthModule} An instance of a constant source module.
   */
  C(v = 0) {
    const Module = class C extends this.SynthModule {
      z = this.minuteSynth.audioContext.createConstantSource()

      constructor() {
        super()
        this._addParam(new this.ParamValue('v', this.z.offset, v))
        this.z.start()
      }
    }
    return new Module()
  }

  /**
   * Gain (Amplifier) is a very simple module that acts as a multiplier.
   * @param {number | SynthModule | [] | undefined} g - The gain value (default: 1).
   * @param {number | SynthModule | [] | undefined} r$ - Optional input to be connected to the gain parameter.
   * @return {SynthModule} An instance of a gain module.
   */
  Gain({ g = 1, r$ } = {}) {
    const Module = class Gain extends this.BaseAmp {
      constructor() {
        super(g)
        this._addParam(new this.ParamAudio(this.z, r$))
      }
    }
    return new Module()
  }

  /**
   * ADSR (Attack, Decay, Sustain, Release) uses ADSR parameters to create a module that
   * can allow values to ramp up and down whenever the module is triggered. Use the t$ 
   * (second parameter) to reverse-bind a trigger.
   * @param {MinuteSynth.ADSRParams | object | undefined} adsr - The ADSR parameters to use for this module (default: this._DEFAULT_ADSR).
   * @param {SynthModule | undefined} t$ - Optional trigger input for this module.
   * @returns {SynthModule} An instance of an ADSR module.
   */
  ADSR(adsr = {}, t$) {
    // TODO: Try to extend a class for more conciseness and consistency with other modules
    const module = this.C()
    module.a = { ...MinuteSynth._DEFAULT_ADSR, ...adsr } // Fill in any missing parameters with defaults
    module._offState = true
    module._newState = true

    /**
     * on is called manually or by the Voice to engage the ADSR action (attack, decay,
     * sustain).
     * @param {number} onTime - The time at which to start the ADSR action.
     * @param {number} freq - Ununsed
     */
    module.on = function(onTime, freq) {
      // TODO: Allow onTime to be 0 for immediate action
      if (module._newState) {
        module.v.vT(module.a.b, onTime)
        module._newState = false
      }
      else {
        module.v.c(onTime + module.a.D)
      }
      module.v.t(module.a.e, onTime + module.a.D, module.a.a / 3)
      module.v.t(module.a.s, onTime + module.a.D + module.a.a, module.a.d / 3)
      module._offState = false
      if (module.a.p) {
        module.off(onTime + module.a.p)
      }
    }

    /** 
     * triggerOff will cause the ADSR action to conclude (release).
     * @param {number} offTime - The time at which to start the release action.
     */
    module.off = function(offTime) {
      // TODO: Allow offTime to be 0 for immediate action
      if (module._offState) {
        module.v.vT(module.a.b, offTime)
      }
      else {
        module.v.c(offTime) // if note duration is shorter than A + D.
        module.v.t(module.a.b, offTime, module.a.r / 3)
        //Z.v.vT(Z.a.b, offTime + Z.a.r + 6) // Force zero because t doesn't get there.
        module._offState = true
      }
    }

    // Need to do this after on() method was called in case t$ is used to trigger.
    module._addParam(new module.ParamAudio(module, t$))
    return module
  }

  /**
   * Prog (Program) orchestrates a series of values on a constant output that can be triggered.
   * @param {number[]} t - Timesteps (seconds from trigger) array
   * @param {number[]} v - Values array
   * @param {number | undefined} p - Portamento (glide) time (default: 0)
   * @returns {SynthModule} An instance of a program module
   */
  Prog({ t, v, p = 0 }) {
    const module = this.Freq({p})
    const origOnFn = module.on
    const origOffFn = module.off
    module.on = (onTime, freq) => {
      t.forEach((time, i) => v[i] ? origOnFn.call(module, onTime + time, v[i])
        : origOffFn.call(module, onTime + time))
    }
    return module
  }

  /** 
   * Spec (Spectrum) creates a complex oscillator waveform from a series of real frequencies.
   * Gains are defaulted to 1 unless an array of gains are specified.
   * @param {number[]} F - Array of frequencies
   * @param {number[] | undefined} G - Array of gains (default: 1's)
   * @param {number | undefined} n - Nominal frequency
   * @param {number | undefined} R - Resolution (default: sample rate / 4)
   * @param {number | SynthModule | []} f - default frequency
   * @param {number | undefined} s - start time (default: 0)
   * @param {number | SynthModule | [] | undefined} g - gain (default: 1)
   * @param {number | undefined} S - scale (default: sample rate / R)
   * @returns {SynthModule} An instance of a spectrum module
   */
  Spec({ F, G, n = 440, R = this.audioContext.sampleRate / 4, f, s = 0, g = 1, S = 1 }) {
    const real = new Array(R).fill(0)
    const imag = [...real]
    for (let i in F) {
      let j = ~~(F[i] * R / this.audioContext.sampleRate)
      if (j < R) {
        real[j] = G ? G[i] : 1
      }
    }
    const module = this.Osc({ r: real, i: imag, f, s, g, S: this.audioContext.sampleRate / R * S, n })
    return module
  }

  /**
   * Freq (Frequency Module) is like a voltage control to attach to oscillators and other frequency inputs.
   * It centrally manages a frequency and optionally has a glide (portamento) capability.
   * Use the t$ (second parameter) to reverse-bind a trigger.
   * @param {number | undefined} p - Portamento (glide) time (default: 0)
   * @param {SynthModule | undefined} t$ - Optional trigger input for this module.
   * @returns {SynthModule} An instance of a frequency control module
   */
  Freq({ p = 0, t$ } = {}) {
    // TODO: Try to extend a class for more conciseness and consistency with other modules
    const module = this.C()
    module.p = p
    module._prevFreq = 0

    /** 
     * on() is called manually or by the Voice to set the next frequency.
     */
    module.on = (onTime, freq) => {
      // TODO: Can we use setTarget with 0 time constant?
      if (module._prevFreq && module.p) {
        module.v.t(freq, onTime, module.p / 3)
      }
      else {
        module.v.vT(freq, onTime)
      }
      module._prevFreq = freq
    }

    // Allow for triggering via a similar mechanism as used for connecting audio:
    module._addParam(new module.ParamAudio(module, t$))
    return module
  }

  /**
   * ACN is a wrapper for an arbitrary AudioContext node, to facilitate connection
   * tracking and parameter manipulation offered through this framework.
   * @param {AudioNode} N - The destination AudioNode to connect to
   * @param {number | SynthModule | [] | undefined} r$ - Optional input to be connected to the destination parameter.
   * @returns {SynthModule} An instance of a destination module
   */
  // TODO: Add the ability to add in arbitrary parameters via object
  ACN(N, r$) {
    const Module = class ACN extends this.SynthModule {
      z = N

      constructor() {
        super()
        this._addParam(new this.ParamAudio(this.z, r$))
      }
    }
    return new Module()
  }

  /**
   * Voice represents a single channel of sound that is controlled by one main frequency.
   * The gain g is the final "volume control" and its output is the AudioContext's destination.
   * Set v to zero to disable attaching to this.audioContext.destination. You can
   * get final WebAudio from .z. An automatically generated frequency controller is available at .f.
   * @param {number | SynthModule | []  | undefined} g - Gain (default: 0.5)
   * @param {boolean | undefined} v - Set to true to automatically connect to default destination (default: true)
   * @param {number | SynthModule | [] | undefined} p - default frequency
   * @param {number | SynthModule | [] | undefined} r$ - reverse-attach input for frequency control
   * @returns {SynthModule} An instance of a voice module
   */
  Voice({ g = 0.5, v = true, p, r$ } = {}) {
    // TODO: Try to extend the class for more conciseness and consistency with other modules
    // TODO: Allow inputs to be registrants
    const module = this.Gain({ g, r$ })
    module._modules = [] // Modules registered to receive on/off triggers
    module.f = this.Freq({p}) // Frequency control module. Set it by calling on().

    /**
     * _$ is "internal attach" that is used to facilitate underlying output AudioNode to parameter
     * connection. Return a nonzero to automatically remove values from input.
     */
    module.super_$ = module._$
    module._$ = (targetObj) => {
      if (targetObj.on) {
        module.rg(targetObj)
        return 0
      }
      else {
        return module.super_$(targetObj)
      }
    }

    /**
     * rg() allows a module to be registered with this voice to receive trigger events.
     * The preferred way is to attach Voice to registered modules with .$()
     */
    // TODO: Singular "passthrough" register that returns the same object. Or return if single item.
    module.rg = (...modules) =>{
      module._modules.push.apply(module._modules, modules)
      return modules[0]
    }

    /**
     * Removes Modules from the Voice's triggering control.
     */
    module.drg = (...modules) => {
      modules.forEach(module => module._modules.splice(module._modules.indexOf(module), 1))
    }

    /**
     * This will call on() for all Modules registered.
     */
    module.on = (onTime, freq) => {
      !onTime && (onTime = this.now())
      module._modules.forEach(module => module.on && module.on(onTime, freq))
    }

    /**
     * This will call off() for all Modules registered.
     */
    module.off = (offTime) => {
      !offTime && (offTime = this.now())
      module._modules.forEach(module => module.off && module.off(offTime))
    }

    module._$(module.f) // Attach frequency control to the voice
    v && module.$(this.audioContext.destination) // Attach voice to destination if v is true
    return module
  }

  /**
   * now will return the AudioContext's current time in seconds.
   * @returns {number} The current time of the AudioContext in seconds.
   */
  now() {
    return this.audioContext.currentTime
  }

  // -- Support functions: --

  /**
   * reverb() is a simple reverb effect, borrowed from
   * https://github.com/adelespinasse/reverbGen/blob/master/reverbgen.js
   * @param {number} fadeInTime - The time it takes for the reverb to fade in
   * @param {number} decayTime - The time it takes for -60dB fadeout
   * @param {number} subsample - The subsample rate for the reverb
   * @param {number | undefined} numChan - The number of channels for the reverb (default: 2)
   * @returns {AudioBuffer} The reverb buffer
   */
  reverb(fadeInTime, decayTime, subsample, numChan = 2) {
    // params.decayTime is the -60dB fade time. We let it go 50% longer to get to -90dB.
    const totalTime = decayTime * 1.5
    const decaySampleFrames = ~~(decayTime * this.audioContext.sampleRate)
    const fadeInSampleFrames = ~~(fadeInTime * this.audioContext.sampleRate)
    // 60dB is a factor of 1 million in power, or 1000 in amplitude.
    const decayBase = 1e-3 ** (1 / decaySampleFrames)
    const reverbIR = this.Buf({ c: numChan, T: totalTime })
    for (let i = 0; i < numChan; i++) {
      let chan = reverbIR.mem(i)
      for (let j = 0; j < reverbIR.N; j++) {
        chan[j] = (Math.random() > subsample) ? (Math.random() * 2 - 1) * decayBase ** j : 0
      }
      for (let j = 0; j < fadeInSampleFrames; j++) {
        chan[j] *= j / fadeInSampleFrames
      }
    }
    return reverbIR.b
  }

  /**
   * dw is a simple distortion effect used by the Distortion module that "warms" waves through a sigmoid,
   * borrowed from https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
   * @param {number} amount - The amount of distortion to apply
   * @param {number} W - The width of the distortion curve
   * @returns {Float32Array} The distortion curve
   */
  dw(amount = 50, W = 8192) {
    const curve = new Float32Array(W)
    const deg = Math.PI / 180
    for (let i = 0; i < W; ++i) {
      let x = i * 2 / W - 1
      curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x))
    }
    return curve
  }
}
