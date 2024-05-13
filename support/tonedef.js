/* tonedef.js: A palette of tone definitions to serve as examples within 
   MinuteSynth Lab */

// Each ToneDef shall be an object that fits this:
//   fn: function that takes a MinuteSynth object and return a Voice.
//   off: Time that voice is to be shut off for recording purposes, or
//        undefined or 0 for default.
//   rec: Desired record duration. (Keep it 4.68 or less to fit within MOD
//        specs unless the default 27928 Hz sample rate is decreased.
//   freq: Recording tone frequency (default: 440 Hz)
//         Freq. referece: https://www.liutaiomottola.com/formulae/freqtab.htm
//   sr: Sample rate override-- forces sampling at given rate
//   chan: Number of channels to record. Default: 1
const ToneDefs = {
  basicTone: {
    fn: m$ => {
      // Demonstrates creation of ADSR control on a simple tone

    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicFM: {
    fn: m$ => {
      // Demonstrates FM synthesis

    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicSweep: {
    fn: m$ => {
      // Bandpass filter sweeping up, using an ADSR

    },
    freq: 440,
    rec: 4,
    off: 3
  },
  cowbell808: {
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
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
      const voice = m$.Voice(),
            adsr = m$.ADSR({ a: 0.0001, d: 0.02, s: 0 }, voice),
            noise = m$.Noise({ g: adsr }),
            filter = m$.Filt({ t: m$.bandpass, q: 0.8, f: 2000, r$: noise, g: 2 })
              // Bring down f to your liking
      filter.$(voice)
      return voice
    },
    freq: 100,
    off: 0.1,
    rec: 0.1
  },
  groundLoop50hz: {
    fn: m$ => {
      const voice = m$.Voice(),
            osc1 = m$.Osc({ t: m$.sine, f: 50 }),
            distorter = m$.Dist({ a: 30, r$: osc1 }),
            filter = m$.Filt({ t: m$.highpass, q: 0.5, f: 3000, r$: distorter }),
              // Bring down f to your liking
            compressor = m$.Comp({ k: 0.5, g: 5, r$: filter }),
            reverb = m$.K({ b: m$.reverb(0.1, 1, 0.95), r$: compressor, g: 2 })
      reverb.$(voice)
      return voice
    },
    freq: 50,
    off: 5,
    rec: 6
  },
  interference: {
    fn: m$ => {
      // When you put a consumer-grade laptop analog out onto a loud amplifier...
      const voice = m$.Voice(),
            noise = m$.Noise(),
            noiseGate = m$.Noise({ r: 0.001 }),
            gateDistort = m$.Dist({ a: 500, r$: noiseGate, g: 5 }),
            noiseGain = m$.Gain({ g: 0.5, r$: gateDistort }),
            filter = m$.Filt({ t: 'bandpass', q: 30, f: 2200, r$: noise,
                               g: [m$.C(0.5), noiseGain] }),
            distorter = m$.Dist({ a: 50, r$: filter }),
            otherGate = m$.Osc({ t: 'square', f: 31, g: 0.5 }),
            otherGate2 = m$.Osc({ t: 'square', f: 13, g: 0.5 }),
            gateGain1 = m$.Gain({ g: [m$.C(0.5), otherGate], r$: distorter }),
            gateGain2 = m$.Gain({ g: [m$.C(0.7), otherGate2], r$: gateGain1 }),
            filterAgain = m$.Filt({ t: 'bandpass', q: 30, f: 4400, r$: gateGain2, g: 2 }),
            distorterAgain = m$.Dist({ a: 1.2, g: 30, r$: filterAgain })
      distorterAgain.$(voice)
      return voice
    },
    freq: 100,
    off: 3,
    rec: 3
  },
  kitten: {
    fn: m$ => {
      // Created by 7r1x/neuralyte
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
      // Created by 7r1x/neuralyte
      const voice = m$.Voice(),
            slide1 = m$.ADSR({ a: 0.2, b: 5000, e: 220, s: 1, r: 0.1 }, voice),
            adsr = m$.ADSR({ D: 0, b: 0, e: 1, s: 1.8, a: 1, d: 1, r: 0.1, p: 0.1 }, voice),
            osc1 = m$.Osc({ t: m$.sine, f: slide1, S: 1, g: adsr }),
            compress = m$.Comp({ g: 1, k: 4, r$: osc1 })
      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 0.5,
    rec: 1
  },
  chip: {
    fn: m$ => {
      let voice = m$.Voice({ g: 0.7 }),
          tone1 = m$.Osc({ t: ms$.triangle, S: 1/2, g: 0.5 }),
          tone2 = m$.Pulse({ w: 2/16, o: 5/16, S: 1/2, g: 0.75 }),
          fADSR = m$.ADSR({ b: 2000, a: 0.1, e: 4000, d: 3, s: 2000, r: 4 }, voice),
          highpass = m$.Filt({ t: m$.highpass, q: 4, f: fADSR, r$: [tone1, tone2] }),
          lowpass = m$.Filt({ t: m$.lowpass, q: 0.2, f: 4000, r$: highpass }),
          ampADSR = m$.ADSR({ d: 3, s: 0.8, r: 0.1 }, voice),
          amp = m$.Gain({ g: ampADSR, r$: [tone1, tone2, lowpass] });
      voice.f.$(tone1.f).$(tone2.f);
      amp.$(voice);
      return voice;
    },
    off: 2.2,
    rec: 2.3
  },
  hiHat: {
    fn: m$ => {
      // From http://joesul.li/van/synthesizing-hi-hats/
      let fundamental = 40,
          ratios = [2, 3, 4.16, 5.43, 6.79, 8.21],
          bandFilter = m$.Filt({ t: m$.bandpass, q: 1, f: 10000 }),
          hiFilter = m$.Filt({ t: m$.highpass, q: 1, f: 7000, r$: bandFilter });
      ratios.forEach(ratio => m$.Osc({ t: m$.square, f: ratio * fundamental }).$(bandFilter));
      let voice = m$.Voice({ g: .5, r$: hiFilter });
      let adsrMod = m$.ADSR({ a: 0.01, e: 4, d: 0.05, s: 0 }, voice);
      adsrMod.$(hiFilter.g);
      return voice;
    },
    rec: 0.1
  },
  pad1: {
    fn: m$ => {
      let voice = m$.Voice({a: 1.9}),
          // First oscillator will be a sawtooth:
          osc1 = m$.Osc({t: 'sawtooth', f: voice.f, g: 1, S: 1}),

          // Second square oscillator will be warbled slightly with a sinewave:
          lfo1 = m$.Gain({g: voice.f, r$: m$.Osc({t: 'sine', f: 6, g: 1/880})}),
          osc2 = m$.Osc({t: 'square', f: [voice.f, lfo1], g: 0.5, S: 1/2}),

          // Throw in this slightly detuned oscillator, too:
          osc2b = m$.Osc({t: 'square', f: [voice.f, lfo1], g: 0.4, d: 12, S: 1/2}),

          // Set up the filter frequency to swell over 4s, and also to slowly warble:
          fADSR = m$.ADSR({b: 300, a: 4, e: 4000, d: 3, s: 2000, r: 3}, voice),
          lfo2 = m$.Osc({t: 'sine', f: 4, g: 100}),
          filter = m$.Filt({t: 'lowpass', f: [fADSR, lfo2], q: 0.5, r$: [osc1, osc2, osc2b]}),

          // The final amp will fade in and out slowly:
          padADSR = m$.ADSR({a: 3, d: 0, s: 1, r: 1}, voice),
          amp = m$.Gain({g: padADSR, r$: filter}),

          // Add a reverb to smooth out the sound. If we had 2 channels, we'd get
          // some chorus effect, too.
          reverb = m$.Conv({b: m$.reverb(0.1, 1, 0.95), r$: amp, g: 5})

      reverb.$(voice);
      return voice;
    },
    off: 0.5
  },
  kick: {
    fn: m$ => {
      // Note that this is rendered at a lower sample rate so that the end result is
      // pitched up. Try it at 9000, too!
      let noise = m$.Noise(),
          lfADSR = m$.ADSR({b: 4000, a: 0.15, e: 10, d: 1, s: 370}),
          lowFilter = m$.Filt({t: m$.lowpass, q: 0.3, f: lfADSR, g: 1, r$: noise}),
          outGain = m$.Gain({r$: lowFilter}),
          freqs = [50, 793, 990, 2685, 4672, 6941, 14609, 18526],
          qs = [2, 7, 10, 5, 10, 20, 5, 5],
          gains = [1, 0.5, 0.4, 0.3, 0.4, 0.5, 0.2, 0.1],
          fADSR = m$.ADSR({a: 0.7, e: 200}),
          aADSR0 = m$.ADSR({d: 0.3, s: 0}),
          aADSR = m$.ADSR({d: 0.5, e: 0.2, s: 0.8}),
          i, filter;
      for (i = 0; i < freqs.length; i++) {
      filter = m$.Filt({t: m$.bandpass, q: qs[i], f: freqs[i], g: gains[i], r$: noise});
      if (i == 0) {
          m$.C(gains[i]).$(filter.g)
          aADSR0.$(filter.g);
      }
      else if (i == 1 || i == 2 || i == 6) {
          m$.C(freqs[i]).$(filter.f);
          fADSR.$(filter.f);
      }
      else {
          m$.C(gains[i]).$(filter.g)
          aADSR.$(filter.g);
      }
      filter.$(outGain);
      }
      let voice = m$.Voice({g: 1, r$: outGain});
      voice.rg(fADSR, aADSR, aADSR0, lfADSR);
      let adsrMod = voice.rg(m$.ADSR({a: 0.01, d: 0.6, s: 0}));
      adsrMod.$(outGain.g);
      return voice;
    },
    rec: 1.8,
    sr: 11000
  },
  bell: {
    fn: m$ => {
      // Help from: https://www.soundonsound.com/techniques/synthesizing-bells
      let voice = m$.Voice(),
          fADSR = m$.ADSR({a: 0.01, e: 2, p: 0.02, r: 1.5, b: 0.5}, voice),
          fMult = m$.Gain({g: fADSR, r$: voice.f}),
          filter = m$.Filt({t: 'lowpass', g: 1, q: 1, f: fMult}),
          dADSR = m$.ADSR({a: 0.01, e: 0.3, r: 0.8, p: 0.02}, voice),
          distorter = m$.Dist({a: 2, g: dADSR, r$: filter}),
          mADSR = m$.ADSR({a: 0.01, r: 1.5, p: 0.02}, voice),
          mAmp = m$.Gain({g: mADSR, r$: filter}),
          harmonics = [0.5, 2, 3, 4.2, 5.4, 6.8];
      mAmp.$(voice);
      distorter.$(voice);
      harmonics.forEach(h => m$.Osc({f: voice.f, S: h, t: 'triangle'}).$(filter));
      return voice;
    },
    freq: 880,
    off: 2.3
  },
  foghornBass: {
    fn: m$ => {
      // Created by 7r1x/neuralyte
      let voice = m$.Voice(),
        carrier = m$.Osc({t: m$.triangle, f: voice.f, S: 1/8, g: 1/4}),
        fMult = m$.Gain({g: voice.f, r$: carrier}),
        modulator = m$.Osc({t: m$.sine, f: [voice.f, fMult], g: 1/2, S: 1/2}),
        fADSR = m$.ADSR({b: 0.05, a: 0.5, e: .4, d: 1, s: 0.5, r: 0.2}, voice),
        fADSRMult = m$.Gain({g: voice.f, r$: fADSR}),
        filter = m$.Filt({t: m$.lowpass, q: 1, f: fADSRMult, r$: modulator}),
        distorter = m$.Dist({a: 15, r$: filter}),
        loud = m$.Gain({g:3, r$: distorter});
      loud.$(voice);
      m$.ADSR({r: 1}, voice).$(voice.g);
      return voice;
    },
    freq: 440,
    off: 1.2,
    rec: 2.2
  },
  splash: {
    fn: m$ => {
      // Drawn from http://joesul.li/van/synthesizing-hi-hats/
      let fundamental = 20,
          ratios = [2, 3, 4.16, 5.43, 6.79, 8.21],
          fADSR1 = m$.ADSR({a: 0.05, b: 2000, e: 10000, d: 0, s: 10000}),
          fADSR2 = m$.ADSR({a: 0.1, b: 200, e: 10000, d: 1, s: 5000}),
          bandFilter = m$.Filt({t: m$.bandpass, q: 0.02, f: fADSR1}),
          hiFilter = m$.Filt({t: m$.highpass, q: 0.02, f: fADSR2, r$: bandFilter}),
          reverb = m$.Conv({b: U.sr(0, 0.5, 0), n: true, g: 10, r$: hiFilter})
      ratios.forEach(ratio => m$.Noise().$(m$.Filt({t: m$.bandpass, f: ratio * fundamental, q: 0.2, g: 3}).$(bandFilter)));
      let voice = m$.Voice({g: 1, r$: reverb}),
          adsrMod = m$.ADSR({a: 0.01, d: 1, s: 0}, voice);
      adsrMod.$(hiFilter.g);
      voice.rg(fADSR1, fADSR2);
      return voice;
    },
    off: .8,
    rec: 2
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    ToneDefs
  }
}
  