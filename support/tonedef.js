/* tonedef.js: A palette of tone definitions to serve as examples within 
   MinuteSynth Lab */

// Each ToneDef shall be an object that fits this:
//   fn: function that takes a MinuteSynth object and return a Voice.
//   off: Time that voice is to be shut off for recording purposes, or
//        undefined or 0 for default.
//   rec: Desired record duration. (Keep it 4.68 or less to fit within MOD
//        specs unless the default 27928 Hz sample rate is decreased.
//   freq: Recording tone frequency (default: 440 Hz)
//   sr: Sample rate override-- forces sampling at given rate
//   chan: Number of channels to record. Default: 1
const ToneDefs = {
  cowbell: {
    fn: m$ => {
      // From http://outputchannel.com/post/tr-808-cowbell-web-audio/
      const voice = m$.Voice(),
            osc1 = m$.Osc({ t: 'square', f: voice.f }),
            osc2 = m$.Osc({ t: 'square', f: voice.f, S: 800/540 }),
            adsr = m$.ADSR({ a: 0.01, p: 0.01, r: 0.1 }, voice),
            filter = m$.Filt({ t: 'bandpass', f: 350, q: 1, g: adsr, r$: [osc1, osc2] })
      filter.$(voice)
      return voice
    },
    freq: 660,
    rec: 0.3,
    off: 0.15
  },
  reese: {
    fn: m$ => {
      // https://www.liutaiomottola.com/formulae/freqtab.htm
      const voice = m$.Voice(),
            osc1 = m$.Osc({ t: 'square', f: voice.f, S: 1/4 }),
            osc2 = m$.Osc({ t: 'sawtooth', f: voice.f, S: 2 }),
            unison1 = m$.Osc({ t: 'sawtooth', f: voice.f, S: 2.05, g: 0.4 }),
            unison2 = m$.Osc({ t: 'sawtooth', f: voice.f, S: 1.95, g: 0.4 }),
            osc3 = m$.Osc({ t: 'sine', f: voice.f, S: 1/8 }),
            adsr = m$.ADSR({ a: 0.01, p: 3, r: 0.1 }, voice),
            filter = m$.Filt({ t: 'lowpass', f: voice.f, q: 3, g: adsr,
                                 r$: [osc1, osc2, osc3, unison1, unison2] })
      filter.$(voice)
      return voice
    },
    freq: 130.813,
    rec: 1,
    off: 0.9
  },
  organy: {
    fn: m$ => {
      const voice = m$.Voice(),
            osc1 = m$.Osc({ t: 'square', f: voice.f, S: 1/2, g: 0.6 }),
            // Also, try S: 4
            osc2 = m$.Osc({ t: 'sine', f: voice.f, S: 3, g: 0.8 }),
            unison1 = m$.Osc({ t: 'sine', f: voice.f, S: 3.02, g: 0.2 }),
            unison2 = m$.Osc({ t: 'sine', f: voice.f, S: 3.98, g: 0.2 }),
            osc3 = m$.Osc({ t: 'sine', f: voice.f, S: 1, g: 0.9 }),
            adsr = m$.ADSR({ a: 0.01, p: 1.8, r: 0.1 }, voice),
            filter = m$.Filt({ t: 'lowpass', f: 200, q: 3, g: adsr,
                               r$: [osc1, osc2, osc3, unison1, unison2] })
      filter.$(voice)
      return voice
    },
    freq: 110,
    rec: 2,
    off: 2
  },
  octane: {
    fn: m$ => {
      const voice = m$.Voice()
      const osc1 = m$.Osc({ t: 'square', f: voice.f, S: 1/2, g: 0.4 })
      // try S: 4
      const osc2 = m$.Osc({ t: 'sine', f: voice.f, S: 3, g: 0.5 })
      const unison1 = m$.Osc({ t: 'sine', f: voice.f, S: 3.02, g: 0.2 })
      const unison2 = m$.Osc({ t: 'sine', f: voice.f, S: 3.98, g: 0.2 })
      const osc3 = m$.Osc({ t: 'sine', f: voice.f, S: 1, g: 0.9 })
      const adsr = m$.ADSR({ a: 0.01, p: 1.8, r: 0.1 }, voice)
      const filter = m$.Filt({ t: 'lowpass', f: 200, q: 3, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
      filter.$(voice)
      return voice
    },
    freq: 165, // E-3
    rec: 2,
    off: 2
  },
  helicopter: {
    fn: m$ => {
      const voice = m$.Voice()
      const noise = m$.Noise({ g: 3 })
      const lfo = m$.Osc({ t: 'sine', f: 15, g: 1500 })
      const filter = m$.Filt({ t: 'lowpass', f: lfo, q: 2, r$: noise })

      filter.$(voice)
      return voice
    },
    freq: 165, // E-3
    rec: 2,
    off: 2
  },
  clean808bass: {
    fn: m$ => {
      const voice = m$.Voice()
      const adsr = m$.ADSR({ D: 0, b: 0, e: 2, a: 0.03, d: 0.4, s: 1, r: 1, p: 0 }, voice)
      const osc1 = m$.Osc({ t: 'sine', f: voice.f, S: 1/2, g: adsr })
      const filter = m$.Filt({ t: 'lowpass', f: 1200, q: 2, g: 1, r$: osc1 })

      filter.$(voice)
      return voice
    },
    freq: 175,
    off: 1.2,
    rec: 3
  },
  optical: {
    fn: m$ => {
      const voice = m$.Voice()
      const slide1 = m$.ADSR({ a: 2, b: 146, e: 78, s: 390, r: 1 }, voice)
      var adsr = m$.ADSR({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
      const osc1 = m$.Osc({ t: 'sine', f: slide1, S: 1/2, g: adsr })
      const noiseADSR = adsr = m$.ADSR({ D: 0.4, b: 0, e: 0.01, s: 0.05, a: 1, d: 0.1, r: 0.1, p: 0 }, voice)
      const noise = m$.Noise({ g: noiseADSR })
      const distort = m$.Dist({ a: 4, r$: [osc1, noise], g: 4 })
      const filterADSR = adsr = m$.ADSR({ D: 0.01, b: 2000, e: 50, s: 3200, a: 0.4, d: 0.1, r: 0.5, p: 0 }, voice)
  
      const filter = m$.Filt({ t: 'highpass', f: filterADSR, q: 10, g: 0.65, r$: distort })
      const compress = m$.Comp({ g: 4, k: 4, r$: filter })
  
      compress.$(voice)
      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 1.301,
    rec: 3
  },    
  bberband: {
    fn: m$ => {
      const voice = m$.Voice()
      const slide1 = m$.ADSR({ a: 2, b: 146, e: 0.73, s: 1, r: 1 }, voice)
      var adsr = m$.ADSR({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
      const osc1 = m$.Osc({ t: 'sine', f: slide1, S: 1/2, g: adsr })
      const distort = m$.Dist({ a: 55, r$: osc1, g: 1 })
      const filterADSR = adsr = m$.ADSR({ D: 0.01, b: 1000, e: 100, s: 1000, a: 0.21, d: 0.1, r: 0.9, p: 0 }, voice) // change s for fun

      const filter = m$.Filt({ t: 'highpass', f: filterADSR, q: 8, g: 0.65, r$: distort })
      const compress = m$.Comp({ g: 4, k: 4, r$: filter })

      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 1.301,
    rec: 3
  },    
  paddy: {
    fn: m$ => {
      const voice = m$.Voice({ g: 0.8 })
      const osc1 = m$.Osc({ t: 'sawtooth', f: voice.f, g: 1, S: 1/2 })
      const osc1b = m$.Osc({ t: 'sawtooth', f: voice.f, g: 0.5, d: 14, S: 1/2 })
      const lfo1 = m$.Gain({ g: voice.f, r$: m$.Osc({ t: 'sine', f: 4, g: 1/880 }) })
      const osc2 = m$.Osc({ t: 'sawtooth', f: [voice.f, lfo1], g: 0.6, d: -12, S: 1/2 })
      const fADSR = m$.ADSR({ b: 100, a: 1, e: 4000, d: 3, s: 100, r: 3 }, voice)
      const lfo2 = m$.Osc({ t: 2, f: 3, g: 100 })
      const filter = m$.Filt({ t: 'highpass', f: [fADSR, lfo2], q: 1, r$: [osc1, osc1b, osc2] })
      const padADSR = m$.ADSR({ a: 1.5, d: 0, s: 1.5, r: 1.3 }, voice)
      const amp = m$.Gain({ g: padADSR, r$: filter })
      const reverb = m$.K({ b: m$.sr(0.1, 1, 0.95), r$: amp, g: 2 })
      reverb.$(voice)
      return voice
    },
    freq: 440,
    off: 0.5,
    rec: 3
  },
  bassFilthTite: {
    fn: m$ => {
      const voice = m$.Voice()
      const slide1 = m$.ADSR({ a: 0.2, b: 146, e: 110, s: 110, r: 1 }, voice)
      var adsr = m$.ADSR({ D: 0, b: 0, e: 2, s: 1, a: 0.01, d: 0.3, r: 0.05, p: 0 }, voice)
      const osc1 = m$.Osc({ t: 'sine', f: slide1, S: 1 / 2, g: adsr })
      const noiseADSR = adsr = m$.ADSR({ D: 0.6, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.1, p: 0 }, voice)
      const noise = m$.Noise({ g: noiseADSR })
      const filter = m$.Filt({ t: 'lowpass', f: 2800, q: 2, g: 1, r$: [osc1, noise] })
      const distort = m$.Dist({ a: 30, r$: filter, g: 1 }) // a = distort amount
      const compress = m$.Comp({ k: 8, r$: distort })

      filter.$(voice)
      distort.$(voice)
      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 1,
    rec: 2
  },
  strangeBass: {
    fn: m$ => {
      const voice = m$.Voice()
      const slide1 = m$.ADSR({ a: 1, b: 146, e: 110, s: 110, r: 1 }, voice)
      var adsr = m$.ADSR({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.01, d: 0.1, r: 0.2, p: 0 }, voice)
      const osc1 = m$.Osc({ t: 'sine', f: slide1, S: 1/2, g: adsr })
      const noiseADSR = adsr = m$.ADSR({ D: 0.28, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.2, p: 0 }, voice)
      const noise = m$.Noise({ g: noiseADSR })
      const distort = m$.Dist({ a: 6, r$: [osc1, noise], g: 4 })
      const filterADSR = adsr = m$.ADSR({ D: 0.01, b: 2000, e: 100, s: 16000, a: 0.3, d: 0.1, r: 0.3, p: 0 }, voice)

      const filter = m$.Filt({ t: 'lowpass', f: filterADSR, q: 2, g: 1, r$: distort })
      filter.$(voice)
      return voice
    },
    freq: 175,
    off: 1,
    rec: 2
  },
  click: {
    fn: m$ => {
      const voice = m$.Voice()
      const adsr = m$.ADSR({ a: 0.0001, d: 0.02, s: 0 }, voice)
      const noise = m$.Noise({ g: adsr })
      const filter = m$.Filt({ t: 'bandpass', q: 0.8, f: 2000, r$: noise, g: 2 }) // Bring down f to your liking
      filter.$(voice)
      return voice
    },
    freq: 100,
    off: 0.1,
    rec: 0.1
  },
  groundLoop50hz: {
    fn: m$ => {
      const voice = m$.Voice()
      const adsr = m$.ADSR({}, voice)
      const osc1 = m$.Osc({ t: 'sine', f: 50 })
      const distorter = m$.Dist({ a: 30, r$: osc1 })
      const filter = m$.Filt({ t: 'highpass', q: 0.5, f: 3000, r$: distorter }) // Bring down f to your liking
      const compressor = m$.Comp({ k: 0.5, g: 5, r$: filter })
      const reverb = m$.K({ b: m$.sr(0.1, 1, 0.95), r$: compressor, g: 2 })
      reverb.$(voice)
      // compressor.$(voice)
      return voice
    },
    freq: 50,
    off: 5,
    rec: 6
  },
  interference: {
    fn: m$ => {
      const voice = m$.Voice()
      const noise = m$.Noise()
      const noiseGate = m$.Noise({ r: 0.001 })
      const gateDistort = m$.Dist({ a: 500, r$: noiseGate, g: 5 })
      const noiseGain = m$.Gain({ g: 0.5, r$: gateDistort })
      const filter = m$.Filt({ t: 'bandpass', q: 30, f: 2200, r$: noise, g: [m$.C(0.5), noiseGain] })
      const distorter = m$.Dist({ a: 50, r$: filter })
      const otherGate = m$.Osc({ t: 'square', f: 31, g: 0.5 })
      const otherGate2 = m$.Osc({ t: 'square', f: 13, g: 0.5 })
      const gateGain1 = m$.Gain({ g: [m$.C(0.5), otherGate], r$: distorter })
      const gateGain2 = m$.Gain({ g: [m$.C(0.7), otherGate2], r$: gateGain1 })
      const filterAgain = m$.Filt({ t: 'bandpass', q: 30, f: 4400, r$: gateGain2, g: 2 })
      const distorterAgain = m$.Dist({ a: 1.2, g: 30, r$: filterAgain })
      distorterAgain.$(voice)
      return voice
    },
    freq: 100,
    off: 3,
    rec: 3
  },
  kitten: {
    fn: m$ => {
      const voice = m$.Voice({ g: 1 })
      const osc1 = m$.Osc({ t: 'sawtooth', f: voice.f, g: 1, S: 1/2 })
      const lfo1 = m$.Gain({ g: voice.f, r$: m$.Osc({ t: 'sine', f: 4, g: 1 }) })
      const fADSR = m$.ADSR({ b: 2, a: 5, e: 16000, d: 3, s: 10, r: 1 }, voice)
      const filter = m$.Filt({ t: 'highpass', f: fADSR, q: 5, r$: osc1 })
      const padADSR = m$.ADSR({ a: 1, d: 0, s: 1, r: 1 }, voice)
      const amp = m$.Gain({ g: padADSR, r$: filter })
      amp.$(voice)
      return voice
    },
    freq: 220,
    off: 0.7,
    rec: 3
  },
  peyow: {
    fn: m$ => {
      const voice = m$.Voice()
      const slide1 = m$.ADSR({ a: 0.2, b: 5000, e: 220, s: 1, r: 0.1 }, voice)
      var adsr = m$.ADSR({ D: 0, b: 0, e: 1, s: 1.8, a: 1, d: 1, r: 0.1, p: 0.1 }, voice)
      const osc1 = m$.Osc({ t: 'sine', f: slide1, S: 1, g: adsr })
      const compress = m$.Comp({ g: 1, k: 4, r$: osc1 })
      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 0.5,
    rec: 1
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    ToneDefs
  }
}
  