"use strict";

// Universal audio cotext reference:

// ACX is a reference to the AudioContext class, for creating AudioContext objects.
var ACX = window.AudioContext || window.webkitAudioContext

class MinuteSynth {
  /**
   * Returns a random number, by default in [-1, 1]:
   * @param {number} m - Range of random number (default: 2)
   * @param {number} a - Offset of random number (default: -1)
   * @returns {number} A random number within the specified range and offset.
   */
/*
  static #random (m = 2, a = -1) {
    return Math.random() * m + a
  }
*/

  /**
   * Calls the given function f on the input a or each element of the input
   * if a is an array:
   * @param {any|any[]} a - The input value or array of values.
   * @param {function} f - The function to apply to each element.
   * @returns {any[]} The result of applying the function to each element.
   */
/*
  static #apply (a, f) {
    return [].concat(a).forEach(element => f(element))
  }
*/

  // Represents Attack, Decay, Sustain, Release parameterized curve.
  // The default ADSR lets the tone stay on until it is shut off.
  static ADSR = class {
    /**
     * Creates an ADSR (Attack, Decay, Sustain, Release) parameterization
     * @param {number} D - start delay for attack
     * @param {number} b - base value (= "off" value)
     * @param {number} e - attack arrival value
     * @param {number} a - attack time (time to go from b to e)
     * @param {number} d - decay time (time to go from e to s)
     * @param {number} s - sustain value (after the attack-decay sequence
     * @param {number} r - release time (from s to b, occurring when triggerOff() is called)
     * @param {number} p - auto-pulse-- if nonzero, automatically does a triggerOff p seconds after triggerOn.
     */     
    constructor({ D = 0, b = 0, e = 1, a = 1e-3, d = 0, s = 1, r = 0, p = 0 } = {}) {
      Object.assign(this, { D, b, e, a, d, s, r, p })
    }
  }

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
   * _SynthModule is a base class for modules that are bound to this MinuteSynth instance.
   * @type {typeof MinuteSynth.SynthModule}
   */
  _SynthModule

  /** @type {typeof MinuteSynth.BaseAmp} */
  _BaseAmp

  /**
   * Constructs a MinuteSynth instance tied to the given AudioContext.
   * @param {AudioContext} ac - The AudioContext to use (default: new AudioContext()).
   */
  constructor(ac = new ACX()) {
    this.audioContext = ac
    this.sampleRate = ac.sampleRate

    const moduleClassMixin = baseClass => class extends baseClass {
      minuteSynth = this
    }

    // Make dynamic base classes that are tied to the AudioContext:
    this._SynthModule = moduleClassMixin(MinuteSynth.SynthModule)
    this._BaseAmp = moduleClassMixin(MinuteSynth.BaseAmp)
  }

  /**
   * Base return type for MinuteSynth modules that expose a series of patchable
   * parameters
   */
  static SynthModule = class {
    /** @type {typeof SynthModule._ParamAudio} */
    _ParamAudio

    /** @type {typeof SynthModule._ParamValue} */
    _ParamValue

    /** @type {typeof SynthModule._ParamStart} */
    _ParamStart

    /**
     * minuteSynth is a reference to the parent MinuteSynth instance
     * @type {MinuteSynth}
     */
    minuteSynth

    /**
     * collection of parameters for this module
     * @type {Object.<string, SynthModule._Param>}
     */
    _params

    /**
     * outParams is a list of parameters that this module is attached to
     * @type {SynthModule._Param[]}
     */
    _outParams

    constructor() {
      assert(this.minuteSynth, "SynthModule must be constructed from a MinuteSynth instance.")
      this._params = {}
      this._outParams = []

      const paramClassMixin = baseClass => class extends baseClass {
        synthModule = this
      }
      this._ParamAudio = paramClassMixin(MinuteSynth._ParamAudio)
      this._ParamValue = paramClassMixin(MinuteSynth._ParamValue)
      this._ParamStart = paramClassMixin(MinuteSynth._ParamStart)
    }

    /**
     * Internal method for deriving a parameter class that is tied with this module
     * @param {typeof SynthModule._Param} baseClass
     * @returns {typeof SynthModule._Param} Param variant tied with this class
     */
    _paramClassMixin(baseClass) {
      return class extends baseClass {
        synthModule = this
      }
    }

    /**
     * Attaches this module to a parameter (or main input) of a downstream module. tgtThing can either be
     * a Module or a Param.
     * @param {MinuteSynth.SynthModule | MinuteSynth._Param} tgtThing 
     * @param {string} tgtParamName - Optional parameter name to attach to if tgtThing is a module. Defaults to "in".
     * @returns {MinuteSynth.SynthModule} The target module, to allow for chaining.
     */
    $(tgtThing, tgtParamName) {
      // TODO: Add option to inherit parameters from target, if target is a module. Don't copy "in", and
      // if param exists in this, add index to it, e.g. "g2". That would allow for easier manipulation
      // of params from one location.
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
     * @param {MinuteSynth.SynthModule | MinuteSynth.SynthModule[]} srcModules - The source module(s) to attach.
     * @param {string} thisParamName - Parameter name to attach to if this module has multiple parameters. Defaults to "in".
     */
    r$(srcModules, thisParamName) {
      [].concat(srcModules).forEach(module => module.$(this, thisParamName))
      return this
    }

    /**
     * "internal attach" that used to facilitate underlying output AudioNode to parameter
     * connection. Return a nonzero to automatically remove values from input.
     * @param {AudioNode} targetObj
     */
    _$(targetObj) {
      this.z.connect(targetObj)
      return 1
    }

    /**
     * Removes an outgoing connection by target module reference, parameter name, or both.
     * If no parameters are specified, then all outgoing connections are removed.
     * @param {MinuteSynth.SynthModule | null | undefined} tgtModule 
     * @param {string | null | undefined} paramName 
     */
    detach(tgtModule, paramName) {
      for (let param of [...this._outParams]) {
        if (!tgtModule || (param.base == tgtModule)) {
          if (!paramName || (param.name == paramName)) {
            param.detach(this)
            this._outParams.splice(this._outParams.indexOf(param), 1)
          }
        }
      }
    }

    /**
     * Removes all connections to and from this module.
     */
    kill() {
      this.detach();
    }

    /**
     * Associates the given parameter with this module, making it accessible by name
     * @param {MinuteSynth._Param} param
     * @return {MinuteSynth._Param} The parameter that was added, to allow for chaining
     */
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
     * @param {number} defFreq 
     */
    _addFreqHelper(control, defFreq = 0) {
      control.value = 0;
      this._S = U.Gain()
      if (!isNaN(defFreq)) {
        // If the default value is a number, then create a constant for it:
        this._C = U.C(defFreq)
        // TODO: Inherit the parameters rather than recreating.
        this._addParam(U._ParamValue('f', this._C.z.offset, this, defFreq))
        this._C.$(this._S)
      }
      else {
        // TODO: Inherit the parameters rather than recreating.
        this._addParam(U._ParamValue('f', this._S.z, this, defFreq))
      }
      this._addParam(U._ParamValue('S', this._S.z.gain, this, this._calcSCRate(1)))
      this._S.z.connect(control)
    }
  }

  /**
   * Represents a parameter that allows for attachment to another module or constant as input
   */
  static _Param = class {
    /** @type {MinuteSynth.SynthModule[]} */
    _inModules

    /** @type {MinuteSynth.SynthModule} */
    synthModule

    /**
     * Cretes a parameter that allows for attachment to another module
     * @param {string} name
     * @param {AudioParam} obj
     * @param {number | string} defVal 
     */
    constructor(name, obj, defVal) {
      assert(this.synthModule, "_Param must be constructed from a SynthModule instance.")

      this._name = name
      this._obj = obj
      this._defVal = defVal
      this._inModules = []
    }

    /**
     * "Reverse attach:" Attach a source module to this parameter. If it is a Voice,
     * then register the voice.
     * @param {MinuteSynth.SynthModule | MinuteSynth.SynthModule[]} srcModules
     * @return {MinuteSynth._Param} The current parameter object, to allow for chaining.
     */  
    r$(srcModules) {
      for (let module of [].concat(srcModules)) {
        this._inModules.push(module)
        if (module._$(this._obj)) {
          this.z0 && this.z0()
        }
      }
      return this
    }

    /**
     * Remove an incoming connection by incoming module reference, or all if no parameter specified
     * @param {MinuteSynth.SynthModule | null | undefined} inModule 
     */
    detach(inModule) {
      for (let module of [...this._inModules]) { // Iterate over copy
        if (!inModule || (module == inModule)) {
          [].concat(this._obj).forEach(obj => module.out.detach(obj))
          this._inModules.splice(this._inModules.indexOf(inModule), 1)
        }
      }
    }
  }

  static _ParamValue = class extends MinuteSynth._Param {
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

  static _ParamAudio = class extends MinuteSynth._Param {
    /**
     * Cretes a parameter that represents an audio input
     * @param {AudioParam} obj
     * @param {number | string} defVal 
     * @param {string} paramName 
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
  static _ParamStart = class extends MinuteSynth._Param {
    /**
     * Cretes a parameter that allows for start/stop control
     * @param {AudioParam} obj
     * @param {number} startTime 
     * @param {number} defVal 
     */
    constructor(obj, startTime, defVal = 0) {
      super('s', obj, defVal)
      this._startTime = startTime
      if (startTime != -1) {
        this.go(startTime)
      }
    }

    go(startTime = 0) {
      this._obj.start((startTime == 0) ? this.synthModule.minuteSynth.audioContext.now() : startTime)
    }

    no(stopTime = 0) {
      this._obj.stop((stopTime == 0) ? this.synthModule.minuteSynth.audioContext.now() : stopTime)
      // TODO: Consider scheduling an object kill() at stopTime
    }
  }

  static BaseAmp = class extends MinuteSynth.SynthModule {
    constructor(gainVal = 1) {
      super()
      this.z = this.minuteSynthaudioContext.createGain()
      this._addParam(new this._ParamValue('g', this.z.gain, gainVal))
    }
  }

  // Convenience/clarity constants for t: type:
  static WaveType = Object.freeze({
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
   * @param {WaveType | number | string} t - Type of waveform
   * @param {number} S - scale (default: 1)
   * @param {number | MinuteSynth.SynthModule} f - default frequency
   * @param {number | MinuteSynth.SynthModule} d - detune (default: 0)
   * @param {number | MinuteSynth.SynthModule} g - gain (default: 1)
   * @param {number} s - start time;
   * @param {Float32Array} r - real values;
   * @param {Float32Array} i - imag. values,
   * @param {number} n - nominal playback frequncy (for custom waveform)
   * @returns {MinuteSynth.SynthModule} An instance of an oscillator module
   */
  Osc({ t, S = 1, f, d, g = 1, s = 0, r, i, n = 1 }) {
    const module = class Osc extends this._BaseAmp {
      o = this.audioContext.createOscillator()
      _calcSCRate = freq => freq * S / n

      constructor() {
        super(g)
        if (t) {
          this.o.type = isNaN(t) ? t : ['sine', 'square', 'sawtooth', 'triangle', 'custom'][t - 1]
        }
        if (r) {
          this.o.setPeriodicWave(this.audioContext.createPeriodicWave(r, i))
        }
        this._addParam(new this._ParamStart(this.o, s))
        this._addParam(new this._ParamValue('d', this.o.detune, d))
        this._addFreqHelper(this.o.frequency, f)
        this.o.connect(this.z)
      }
    }
    return new module()
  }

  /**
   * Buf (Buffer) represents a block of memory that specifies samples. Access the memory with x();
   * the length of the buffer is length. Call L() to lock in the memory so that the buffer can be used.
   * @param {number} T - duration of the buffer in seconds (default: 1)
   * @param {number} c - number of channels (default: 1)
   * @param {number} S - scale (default: 1)
   * @param {number | MinuteSynth.SynthModule} g - gain (default: 1)
   * @param {number} s - start time (default: 0)
   * @param {number} F - sampling rate (default: AudioContext's sample rate)
   * @param {number | MinuteSynth.SynthModule} r - playback rate (default: 1)
   * @param {number | MinuteSynth.SynthModule} d - detune (default: 0)
   * @param {number} n - nominal playback frequency (0 for no freq. control)
   * @returns {MinuteSynth.SynthModule} An instance of a buffer module
   */
  Buf({ T = 1, c = 1, S = 1, g = 1, s = 0, F = this.audioContext.sampleRate, r = 1, d, n = 0, f }) {
    const module = class Buf extends this._BaseAmp {
      b = this.audioContext.createBuffer(c, ~~(F * T), F)
      B = this.audioContext.createBufferSource()
      T = T
      F = F
      N = ~~(F * T)
      _calcSCRate = freq => freq * S * T

      constructor() {
        super(g)
        this._addParam(new this._ParamStart(this.B, this, s))
        this._addParam(new this._ParamValue('d', this.B.detune, d))
        if (n) {
          this._addFreqHelper(this.B.playbackRate, f)
        }
        else {
          this._addParam(new this._ParamValue('r', this.B.playbackRate, r))
        }
        this.B.connect(this.z)
        // TODO: n isn't used except for determing if we are frequency controlled.
      }

      mem(chan = 0) {
        return this.b.getChannelData(chan)
      }

      lock(loop = true) {
        this.B.buffer = this.b
        this.B.loop = loop
      }
    }      
    return module
  }

  /**
   * Noise produces a playable buffer of noise.
   * @param {number | MinuteSynth.SynthModule} g - gain (default: 1)
   * @param {number} s - start time (default: 0)
   * @param {number | MinuteSynth.SynthModule} r - playback rate (default: 1)
   * @param {number | MinuteSynth.SynthModule} d - detune (default: 0)
   * @returns {MinuteSynth.SynthModule} An instance of a noise module
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

  // Pulse produces a pulse waveform of width w at offset o.
  // Params: w: pulse width (0-1); o: pulse offset (0-1); S: scale; f: default frequency; g: gain; s: start time
  //         Also: W: samples
  Pulse ({ w=0.1, o=0, S=1, f, g=1, s=0, W=1024 } = {}) {
    // TODO: We could be cool and make a frequency domain waveform instead.
    let module = U.Buf({T: W / U.SR, S, f, g, s, n: 1}),
        data = module.mem(),
        bias = 0.5 - w,
        i;
    for (i in data) {
      data[i] = bias + ((((i - module.N * o) % module.N) / module.N <= w) ? 0.5 : -0.5);
    }
    module.lock();
    return module;
  }

  // Dist (Distort) performs a wave-shaping operation, allowing for remapping of sampled wave amplitudes
  // Params: F: distort function (default: M$.dw()), a: function parameter, r$: input
  // TODO: Input param: y?
  Dist ({ a=50, F=() => U.dw(a), g=1, r$ }) {
    let module = {
      ...U._ModuleBaseAmp(g),
      w: ac.createWaveShaper()
    };
    module.w.curve = F();
    module.w.oversample = '4x';
    module._addParam(U._ParamAudio(module.w, module, r$));
    module.w.connect(module.z);
    return module;
  }

    // Filt (Filter) allows for filtering of sound using the filter type provided in t.
    // Params: t: type, q: Q value, f: frequency, S: scale, b: boost, g: gain, r$: input
    Filt ({ t, q, f, S=1, b, g=1, r$ }) {
      let module = {
        ...U._ModuleBaseAmp(g),
        q: ac.createBiquadFilter(),
        _calcSCRate: freq => freq * S
      };
      module.q.type = isNaN(t) ? t : ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'][t - 1];
      module._addParam(U._ParamAudio(module.q, module, r$));
      module._addParam(U._ParamValue('Q', module.q.Q, module, q));
      module._addParam(U._ParamValue('b', module.q.gain, module, b));
      module._addFreqHelper(module.q.frequency, f);
      module.q.connect(module.z);
      return module;
    },
    // Convenience/clarity constants for t: type:
    lowpass: 1,
    highpass: 2,
    bandpass: 3,
    lowshelf: 4,
    highshelf: 5,
    peaking: 6,
    notch: 7,
    allpass: 8,

    // Conv (Convolver) sets up a convolution. A BufferNode object shall carry the convolution operation.
    // Use b: M$.reverb() for a simple reverb effect.
    // Params: b: BufferNode, g: gain, n: normalize (true by defualt), r$: input
    Conv ({ b, g=1, n=true, r$ }) {
      let module = {
        ...U._ModuleBaseAmp(g),
        c: ac.createConvolver(),
        b
      };
      module.c.normalize = n;
      module.c.buffer = module.b;
      module._addParam(U._ParamAudio(module.c, module, r$));
      module.c.connect(module.z);
      return module;
    },

    // Comp (Compressor) 
    // Params: t: threshold, k: knee, o: ratio, d: reduction, a: attack, r: release
    Comp ({ t, k, o, d, a, r, g=1, r$ }={}) {
      let module = {
        ...U._ModuleBaseAmp(g),
        R: ac.createDynamicsCompressor()
      };
      module._addParam(U._ParamAudio(module.R, module, r$));
      module._addParam(U._ParamValue('t', module.R.threshold, module, t));
      module._addParam(U._ParamValue('k', module.R.knee, module, k));
      module._addParam(U._ParamValue('o', module.R.ratio, module, o));
      module._addParam(U._ParamValue('d', module.R.reduction, module, d));
      module._addParam(U._ParamValue('a', module.R.attack, module, a));
      module._addParam(U._ParamValue('r', module.R.release, module, r));
      module.R.connect(module.z);
      return module;
    },

    // C (Constant) provides a steady value that can also be manipulated through the 'v' Param.
    C (v=0) {
      let module = {
        ...U._ModuleBase(),
        z: ac.createConstantSource()
      };
      module._addParam(U._ParamValue('v', module.z.offset, module, v));
      module.z.start();
      return module;
    },

    // Gain (Amplifier) is a very simple module that acts as a multiplier.
    // Params: g: gain value; r$: input
    Gain ({ g=1, r$ } = {}) {
      let module = U._ModuleBaseAmp(g);
      module._addParam(U._ParamAudio(module.z, module, r$));
      return module;
    },

    // mA (makeADSR) assists in creating ADSR parameters by filling in the defaults.
    mA: adsr => ({ ...U._DEFAULT_ADSR, ...adsr }),

    // ADSR (Attack, Decay, Sustain, Release) uses ADSR parameters to create a module that
    // can allow values to ramp up and down whenever the module is triggered. Use the t$ 
    // (second parameter) to reverse-bind a trigger.
    ADSR (adsr=U._DEFAULT_ADSR, t$) {
      let module = {
        ...U.C(),
        a: U.mA(adsr),
        _offState: true,
        _newState: true,

        // on is called manually or by the Voice to engage the ADSR action (attack, decay,
        // sustain).
        on (onTime, freq) {
          const Z = this;
          if (Z._newState) {
            Z.v.vT(Z.a.b, onTime);
            Z._newState = false;
          }
          else {
            Z.v.c(onTime + Z.a.D);
          }
          Z.v.t(Z.a.e, onTime + Z.a.D, Z.a.a / 3);
          Z.v.t(Z.a.s, onTime + Z.a.D + Z.a.a, Z.a.d / 3);
          Z._offState = false;
          if (Z.a.p) {
            Z.off(onTime + Z.a.p);
          }
        },

        // triggerOff will cause the ADSR action to conclude (release).
        off (offTime) {
          const Z = this;
          if (Z._offState) {
            Z.v.vT(Z.a.b, offTime);
          }
          else {
            Z.v.c(offTime); // if note duration is shorter than A + D.
            Z.v.t(Z.a.b, offTime, Z.a.r / 3);
            //Z.v.vT(Z.a.b, offTime + Z.a.r + 6); // Force zero because t doesn't get there.
            Z._offState = true;
          }
        }
      };

      // Allow for triggering via a similar mechanism as used for connecting audio:
      module._addParam(U._ParamAudio(module, module, t$));
      return module;
    },

    // Prog (Program) orchestrates a series of values on a constant output that can be triggered.
    // Params: t: timesteps (seconds from trigger) array, v: values array, p: portamento (glide) time
    Prog ({ t, v, p=0 }) {
      const module = U.Freq({p});
      const origOnFn = module.on;
      const origOffFn = module.off;
      module.on = (onTime, freq) => {
        t.forEach((time, i) => v[i] ? origOnFn.call(module, onTime + time, v[i])
          : origOffFn.call(module, onTime + time));
      }
      return module;
    },

    // Spec (Spectrum) creates a complex oscillator waveform from a series of real frequencies.
    // Gains are defaulted to 1 unless an array of gains are specified.
    // Params: F: Array of frequencies, G: Array of gains (default: 1's), n = nominal frequency, R = sample size
    Spec ({ F, G, n=440, R=U.SR/4, f, s=0, g=1, S=1 }) {
      let real = new Array(R).fill(0),
          imag = [...real],
          i, j;
      for (i in F) {
        j = ~~(F[i] * R / U.SR);
        if (j < R) {
          real[j] = G ? G[i] : 1;
        }
      }
      let module = U.Osc({ r: real, i: imag, f, s, g, S: U.SR/R * S, n });
      return module;
    },

    // Freq (FreqModule) is like a voltage control to attach to oscillators and other frequency inputs.
    // It centrally manages a frequency and optionally has a glide (portamento) capability.
    // Use the t$ (second parameter) to reverse-bind a trigger.
    Freq ({ p=0, t$ } = {}) {
      let module = {
        ...U.C(),
        p,
        _prevFreq: 0,

        // on is called manually or by the Voice to set the next frequency.
        on (onTime, freq) {
          // TODO: Can we use setTarget with 0 time constant?
          const Z = this;
          if (Z._prevFreq && Z.p) {
            Z.v.t(freq, onTime, Z.p / 3);
          }
          else {
            Z.v.vT(freq, onTime);
          }
          Z._prevFreq = freq;
        }
      };

      // Allow for triggering via a similar mechanism as used for connecting audio:
      module._addParam(U._ParamAudio(module, module, t$));
      return module;
    },

    // Voice represents a single channel of sound that is controlled by one main frequency.
    // The gain g is the final "volume control" and its output is the AudioContext's destination.
    // Set v to zero to disable attaching to ac.destination. You can get final WebAudio from .z.
    // An automatically generated frequency controller is available at .f.
    Voice ({ g=0.5, v=1, p, r$ } = {}) {
      // TODO: Allow inputs to be registrants
      let ret = {
        ...U.Gain({g, r$}),
        _modules: [],

        // f is the Voice's main frequency control. Set it by calling on().
        f: U.Freq({p}),

        // _$ is "internal attach" that is used to facilitate underlying output AudioNode to parameter
        // connection. Return a nonzero to automatically remove values from input.
        _$ (targetObj) {
          this.rg(targetObj);
          return 0;
        },

        // rg() allows a module to be registered with this voice to receive trigger events.
        // The preferred way is to attach Voice to registered modules with .$()
        // TODO: Singular "passthrough" register that returns the same object. Or return if single item.
        rg (...modules) {
          this._modules.push.apply(this._modules, modules);
          return modules[0];
        },

        /*
        // Removes Modules from the Voice's triggering control.
        deregister(...modules) {
          modules.forEach(module => this.modules.splice(this.modules.indexOf(module), 1));
        },
        */

        // This will call on() for all Modules registered.
        on (onTime, freq) {
          !onTime && (onTime = U.now())
          this._modules.forEach(module => module.on && module.on(onTime, freq));
        },

        // This will call off() for all Modules registered.
        off (offTime) {
          !offTime && (offTime = U.now())
          this._modules.forEach(module => module.off && module.off(offTime));
        },
      };
      ret._$(ret.f);
      v && ret.z.connect(ac.destination);
      return ret;
    },

    // now will return the AudioContext's current time in seconds.
    now: () => ac.currentTime,

    /*
    * Primitives and bases:
    */

    /*
    * Intermediate building-blocks:
    */
    _ModuleBaseAmp (gainVal=1) {
      let ret = {
        ...U._ModuleBase(),
        z: ac.createGain(),
        // +g

        // Disconnects the audio output to allow garbage collection.
        // TODO: Expand this to stop oscillators, etc.
        del() {
          this.z.disconnect();
        }
      };
      ret._addParam(U._ParamValue('g', ret.z.gain, ret, gainVal));
      return ret;
    },
    _ParamValue: (name, obj, module, defVal /*opt.*/) => ({
      ...U._Param(name, obj, module, defVal),
      vC(value) {
        obj.value = value;
      },
      vT(value, startTime) {
        obj.setValueAtTime(value, startTime);
      },
      lT(value, endTime) {
        obj.linearRampToValueAtTime(value, endTime);
      },
      eT(value, endTime) {
        obj.exponentialRampToValueAtTime((Math.abs(value) < 1e-4) ? 1e-4 : value, endTime);
      },
      t(value, startTime, tc) { // tc: Use 1/3 for 95% over 1 sec.
        obj.setTargetAtTime(value, startTime, tc);
      },
      /*
      cv(values, startTime, dur) {
        obj.setValueCurveAtTime(values, startTime, dur);
      },
      */
      c(startTime) {
        obj.cancelScheduledValues(startTime);
      },
      h(holdTime) {
        obj.cancelAndHoldAtTime(holdTime);
      },
      z0() {
        this.vC(0);
      }
    }),

    // ParamAudio allows access for audio inputs to a module.
    _ParamAudio: (obj, module, defVal, paramName='in') => ({
      ...U._Param(paramName, obj, module, defVal),
      z0() {
        obj.value = 0;
      }
    }),

    // ParamStart allows access to the start/stop methods, exposed as 's'. Set startTime to:
    // -1 to defer starting, 0 to autostart now, and other to start at specified time.
    _ParamStart (obj, module, startTime, defVal) {
      let ret = {
        ...U._Param('s', obj, module, defVal),
        go(startTime) {
          obj.start(startTime);
        },
        no(stopTime) {
          obj.stop(stopTime);
          // TODO: Consider scheduling an object kill() at stopTime
        }
      };
      if (startTime != -1) {
        ret.go((startTime == 0) ? U.now() : startTime);
      }
      return ret;
    },

    /*
     * Support functions:
     */
    // reverb() is a simple reverb effect, borrowed from
    // https://github.com/adelespinasse/reverbGen/blob/master/reverbgen.js
    reverb (fadeInTime, decayTime, subsample, numChan=2) {
      // params.decayTime is the -60dB fade time. We let it go 50% longer to get to -90dB.
      let totalTime = decayTime * 1.5,
        decaySampleFrames = ~~(decayTime * U.SR),
        fadeInSampleFrames = ~~(fadeInTime * U.SR),
          // 60dB is a factor of 1 million in power, or 1000 in amplitude.
        decayBase = 1e-3 ** (1 / decaySampleFrames),
        reverbIR = U.Buf({c: numChan, T: totalTime}),
        i, j, chan;
      for (i = 0; i < numChan; i++) {
        chan = reverbIR.mem(i);
        for (j = 0; j < reverbIR.N; j++) {
          chan[j] = ($R(1, 0) > subsample) ? $R() * decayBase ** j : 0;
        }
        for (j = 0; j < fadeInSampleFrames; j++) {
          chan[j] *= j / fadeInSampleFrames;
        }
      }
      return reverbIR.b;
    },

    // dw is a simple distortion effect used by the Distortion module that "warms" waves through a sigmoid,
    // borrowed from https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
    dw (amount=50, W=8192) {
      let curve = new Float32Array(W),
        deg = Math.PI / 180,
        i = 0,
        x;
      for (; i < W; ++i) {
        x = i * 2 / W - 1;
        curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }
  }));
})();
