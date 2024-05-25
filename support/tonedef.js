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
  basicADSR: {
    fn: M$ => {
      // Demonstrates creation of ADSR control on a simple tone
      const voice = M$.Voice()

      // Create ADSR and patch voice trigger into it:
      const adsr = M$.ADSR({ a: 0.5, d: 0.5, s: 0.5, r: 2 }, voice)
      
      // Finish up, using the Voice's frequency generator attribute:
      const osc = M$.Osc({ t: M$.square, f: voice.f, g: adsr })
      osc.$(voice)

      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicFM: {
    fn: M$ => {
      // Demonstrates FM synthesis
      const voice = M$.Voice(),
            sinewave = M$.Osc({ t: M$.sine, f: voice.f }),
            fourFifthFreq = M$.Gain({ g: 4/5, r$: voice.f }),
            squareADSR = M$.ADSR({ p: 0.05, r: 1 }, voice), // Pulse
            squarewave = M$.Osc({ t: M$.square, f: fourFifthFreq, g: squareADSR }),
            multResult = M$.Gain({ g: sinewave, r$: squarewave })
      multResult.$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicFilter: {
    fn: M$ => {
      var voice = M$.Voice(),
          noise = M$.Noise(),
          filter = M$.Filt({ t: M$.bandpass, q: 10, f: voice.f })
          adsr = M$.ADSR({ s: 3 }, voice) // Default on/off, triggered
      noise.$(filter)
      filter.$(voice)
      voice.g.r$(adsr) // Master voice control
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicReverb: {
    fn: M$ => {
      var voice = M$.Voice(),
          adsr = M$.ADSR({}, voice), // Default on/off, triggered
          osc = M$.Osc({ t: M$.square, f: voice.f, g: adsr }),
          reverb = M$.Conv({ b: M$.reverb(0, 2, 0.95), r$: osc })
      reverb.$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 0.5
  },
  basicResonate: {
    fn: M$ => {
      // Resonance demo. Play at Octave 1 or 2
      let voice = M$.Voice(),
          adsr = M$.ADSR({}, voice), // Basic on/off
          osc1 = M$.Osc({ t: M$.square, f: voice.f, g: adsr }),
          osc2 = M$.Osc({ t: M$.triangle, f: voice.f, S: 1/2, g: adsr }),
      // Get a lowpass filter with high Q value to dip from 1000 to 150 then back to 2500:
      sweeper = M$.ADSR({ b: 1000, e: 150, s: 2500, a: 1.5, d: 8, r: 0.5 }, voice),
      lpFilter = M$.Filt({ t: M$.lowpass, q: 18, f: sweeper, g: 1/4 })
      // Link square wave to our filter and then out to voice:
      lpFilter.r$([osc1, osc2])
      voice.r$(lpFilter)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 4
  },
  basicSweep: {
    fn: M$ => {
      // Bandpass filter sweeping up, using an ADSR
      let voice = M$.Voice(),
          adsr = M$.ADSR({}, voice), // Basic on/off
          squareWave = M$.Osc({ t: M$.square, f: voice.f, g: adsr }),
          // Go from 30 to 2000 Hz in 1 sec.:
          sweeper = M$.ADSR({ b: 30, e: 2000, s: 2000, a: 1, r: 0.5 }, voice),
          bpFilter = M$.Filt({ t: M$.bandpass, q: 5, f: sweeper })
      // Link square wave to our filter and then out to voice:
      squareWave.$(bpFilter).$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicLFO: {
    fn: M$ => {
      // Demonstrates LFO on a voice: a vibrato
      // Here are a couple of parameters
      const FREQ = 7 // 7 Hz LFO
      const AMOUNT = 50 // We'll calculate this Hz +/- AMOUNT at 440
      let voice = M$.Voice(),
          // Here's our LFO, oscillating from -1 to 1:
          lfo = M$.Osc({ t: M$.sine, f: FREQ }),

          // We want the vibrato amplitude to be proportional to frequency.
          factor = M$.Gain({ g: AMOUNT / 440, r$: voice.f }),
          lfoScaled = M$.Gain({ g: factor, r$: lfo }),

          adsr = M$.ADSR({}, voice), // Basic on/off
          // Add our scaled LFO to the voice frequency:
          triWave = M$.Osc({ t: M$.triangle, f: [voice.f, lfoScaled], g: adsr })

      triWave.$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicPortamento: {
    fn: M$ => {
      // Demonstration using a frequency controller to create a "sliding" effect
      let voice = M$.Voice(),
          adsr = M$.ADSR({}, voice),
          osc1 = M$.Osc({ t: M$.triangle, f: voice.f, g: adsr })
      voice.f.p = 1/2 // Set portamento to be a half-second
      osc1.$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  cowbell808: {
    fn: M$ => {
      // From http://outputchannel.com/post/tr-808-cowbell-web-audio/
      const voice = M$.Voice(),
            osc1 = M$.Osc({ t: 'square', f: voice.f }),
            osc2 = M$.Osc({ t: 'square', f: voice.f, S: 800/540 }),
            adsr = M$.ADSR({ a: 0.01, p: 0.01, r: 0.1 }, voice),
            filter = M$.Filt({ t: 'bandpass', f: 350, q: 1, g: adsr, r$: [osc1, osc2] })
      filter.$(voice)
      return voice
    },
    freq: 660,
    rec: 0.3,
    off: 0.15
  },
  reese: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      const voice = M$.Voice(),
            osc1 = M$.Osc({ t: 'square', f: voice.f, S: 1/4 }),
            osc2 = M$.Osc({ t: 'sawtooth', f: voice.f, S: 2 }),
            unison1 = M$.Osc({ t: 'sawtooth', f: voice.f, S: 2.05, g: 0.4 }),
            unison2 = M$.Osc({ t: 'sawtooth', f: voice.f, S: 1.95, g: 0.4 }),
            osc3 = M$.Osc({ t: 'sine', f: voice.f, S: 1/8 }),
            adsr = M$.ADSR({ a: 0.01, p: 3, r: 0.1 }, voice),
            filter = M$.Filt({ t: 'lowpass', f: voice.f, q: 3, g: adsr,
                                 r$: [osc1, osc2, osc3, unison1, unison2] })
      filter.$(voice)
      return voice
    },
    freq: 130.813,
    rec: 1,
    off: 0.9
  },
  octane: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      const voice = M$.Voice()
      const osc1 = M$.Osc({ t: 'square', f: voice.f, S: 1/2, g: 0.4 })
      // try S: 4
      const osc2 = M$.Osc({ t: 'sine', f: voice.f, S: 3, g: 0.5 })
      const unison1 = M$.Osc({ t: 'sine', f: voice.f, S: 3.02, g: 0.2 })
      const unison2 = M$.Osc({ t: 'sine', f: voice.f, S: 3.98, g: 0.2 })
      const osc3 = M$.Osc({ t: 'sine', f: voice.f, S: 1, g: 0.9 })
      const adsr = M$.ADSR({ a: 0.01, p: 1.8, r: 0.1 }, voice)
      const filter = M$.Filt({ t: 'lowpass', f: 200, q: 3, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
      filter.$(voice)
      return voice
    },
    freq: 165, // E-3
    rec: 2,
    off: 2
  },
  helicopter: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      const voice = M$.Voice()
      const noise = M$.Noise({ g: 3 })
      const lfo = M$.Osc({ t: 'sine', f: 15, g: 1500 })
      const filter = M$.Filt({ t: 'lowpass', f: lfo, q: 2, r$: noise })

      filter.$(voice)
      return voice
    },
    freq: 165, // E-3
    rec: 2,
    off: 2
  },
  clean808bass: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      const voice = M$.Voice()
      const adsr = M$.ADSR({ D: 0, b: 0, e: 2, a: 0.03, d: 0.4, s: 1, r: 1, p: 0 }, voice)
      const osc1 = M$.Osc({ t: 'sine', f: voice.f, S: 1/2, g: adsr })
      const filter = M$.Filt({ t: 'lowpass', f: 1200, q: 2, g: 1, r$: osc1 })

      filter.$(voice)
      return voice
    },
    freq: 175,
    off: 1.2,
    rec: 3
  },
  optical: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      const voice = M$.Voice()
      const slide1 = M$.ADSR({ a: 2, b: 146, e: 78, s: 390, r: 1 }, voice)
      var adsr = M$.ADSR({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
      const osc1 = M$.Osc({ t: 'sine', f: slide1, S: 1/2, g: adsr })
      const noiseADSR = adsr = M$.ADSR({ D: 0.4, b: 0, e: 0.01, s: 0.05, a: 1, d: 0.1, r: 0.1, p: 0 }, voice)
      const noise = M$.Noise({ g: noiseADSR })
      const distort = M$.Dist({ a: 4, r$: [osc1, noise], g: 4 })
      const filterADSR = adsr = M$.ADSR({ D: 0.01, b: 2000, e: 50, s: 3200, a: 0.4, d: 0.1, r: 0.5, p: 0 }, voice)
  
      const filter = M$.Filt({ t: 'highpass', f: filterADSR, q: 10, g: 0.65, r$: distort })
      const compress = M$.Comp({ g: 4, k: 4, r$: filter })
  
      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 1.301,
    rec: 3
  },    
  bberband: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = M$.Voice()
      const slide1 = M$.ADSR({ a: 2, b: 146, e: 0.73, s: 1, r: 1 }, voice)
      var adsr = M$.ADSR({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
      const osc1 = M$.Osc({ t: 'sine', f: slide1, S: 1/2, g: adsr })
      const distort = M$.Dist({ a: 55, r$: osc1, g: 1 })
      const filterADSR = adsr = M$.ADSR({ D: 0.01, b: 1000, e: 100, s: 1000, a: 0.21, d: 0.1, r: 0.9, p: 0 }, voice) // change s for fun

      const filter = M$.Filt({ t: 'highpass', f: filterADSR, q: 8, g: 0.65, r$: distort })
      const compress = M$.Comp({ g: 4, k: 4, r$: filter })

      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 1.301,
    rec: 3
  },    
  paddy: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      const voice = M$.Voice({ g: 0.8 })
      const osc1 = M$.Osc({ t: 'sawtooth', f: voice.f, g: 1, S: 1/2 })
      const osc1b = M$.Osc({ t: 'sawtooth', f: voice.f, g: 0.5, d: 14, S: 1/2 })
      const lfo1 = M$.Gain({ g: voice.f, r$: M$.Osc({ t: 'sine', f: 4, g: 1/880 }) })
      const osc2 = M$.Osc({ t: 'sawtooth', f: [voice.f, lfo1], g: 0.6, d: -12, S: 1/2 })
      const fADSR = M$.ADSR({ b: 100, a: 1, e: 4000, d: 3, s: 100, r: 3 }, voice)
      const lfo2 = M$.Osc({ t: 2, f: 3, g: 100 })
      const filter = M$.Filt({ t: 'highpass', f: [fADSR, lfo2], q: 1, r$: [osc1, osc1b, osc2] })
      const padADSR = M$.ADSR({ a: 1.5, d: 0, s: 1.5, r: 1.3 }, voice)
      const amp = M$.Gain({ g: padADSR, r$: filter })
      const reverb = M$.Conv({ b: M$.reverb(0.1, 1, 0.95), r$: amp, g: 2 })
      reverb.$(voice)
      return voice
    },
    freq: 440,
    off: 0.5,
    rec: 3
  },
  bassFilthTite: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      let voice = M$.Voice(),
          slide1 = M$.ADSR({ a: 0.2, b: 146, e: 110, s: 110, r: 1 }, voice),

          // Let's scale slide such that we would drop 36 Hz if we played 110 Hz.
          factor = M$.Gain({ g: 36/110, r$: slide1 }),
          freqMod = M$.Gain({ g: factor, r$: voice.f }),

          // Make the voice:
          adsr = M$.ADSR({ D: 0, b: 0, e: 2, s: 1, a: 0.01, d: 0.3, r: 0.05, p: 0 }, voice)
          osc1 = M$.Osc({ t: M$.sine, f: freqMod, S: 1/2, g: adsr }),

          // Other stuff:
          noiseADSR = adsr = M$.ADSR({ D: 0.6, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.1, p: 0 }, voice),
          noise = M$.Noise({ g: noiseADSR }),
          filter = M$.Filt({ t: M$.lowpass, f: 2800, q: 2, g: 1, r$: [osc1, noise] }),
          distort = M$.Dist({ a: 30, r$: filter, g: 1 }), // a = distort amount
          compress = M$.Comp({ k: 8, r$: distort })

      filter.$(voice)
      distort.$(voice)
      compress.$(voice)
      return voice
    },
    freq: 4,
    off: 1,
    rec: 2
  },
  click: {
    fn: M$ => {
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = M$.Voice(),
            adsr = M$.ADSR({ a: 0.0001, d: 0.02, s: 0 }, voice),
            noise = M$.Noise({ g: adsr }),
            filter = M$.Filt({ t: M$.bandpass, q: 0.8, f: 2000, r$: noise, g: 2 })
              // Bring down f to your liking
      filter.$(voice)
      return voice
    },
    freq: 100,
    off: 0.1,
    rec: 0.1
  },
  groundLoop50hz: {
    fn: M$ => {
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = M$.Voice(),
            osc1 = M$.Osc({ t: M$.sine, f: 50 }),
            distorter = M$.Dist({ a: 30, r$: osc1 }),
            filter = M$.Filt({ t: M$.highpass, q: 0.5, f: 3000, r$: distorter }),
              // Bring down f to your liking
            compressor = M$.Comp({ k: 0.5, g: 5, r$: filter }),
            reverb = M$.Conv({ b: M$.reverb(0.1, 1, 0.95), r$: compressor, g: 2 })
      reverb.$(voice)
      return voice
    },
    freq: 50,
    off: 5,
    rec: 6
  },
  interference: {
    fn: M$ => {
      // When you put a consumer-grade laptop analog out onto a loud amplifier...
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = M$.Voice(),
            noise = M$.Noise(),
            noiseGate = M$.Noise({ r: 0.001 }),
            gateDistort = M$.Dist({ a: 500, r$: noiseGate, g: 5 }),
            noiseGain = M$.Gain({ g: 0.5, r$: gateDistort }),
            filter = M$.Filt({ t: 'bandpass', q: 30, f: 2200, r$: noise,
                               g: [M$.C(0.5), noiseGain] }),
            distorter = M$.Dist({ a: 50, r$: filter }),
            otherGate = M$.Osc({ t: 'square', f: 31, g: 0.5 }),
            otherGate2 = M$.Osc({ t: 'square', f: 13, g: 0.5 }),
            gateGain1 = M$.Gain({ g: [M$.C(0.5), otherGate], r$: distorter }),
            gateGain2 = M$.Gain({ g: [M$.C(0.7), otherGate2], r$: gateGain1 }),
            filterAgain = M$.Filt({ t: 'bandpass', q: 30, f: 4400, r$: gateGain2, g: 2 }),
            distorterAgain = M$.Dist({ a: 1.2, g: 30, r$: filterAgain })
      distorterAgain.$(voice)
      return voice
    },
    freq: 100,
    off: 3,
    rec: 3
  },
  kitten: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      let voice = M$.Voice({ g: 1 }),
          osc1 = M$.Osc({ t: 'sawtooth', f: voice.f, g: 1, S: 1/2 }),
          fADSR = M$.ADSR({ b: 2, a: 5, e: 16000, d: 3, s: 10, r: 1 }, voice),
          filter = M$.Filt({ t: 'highpass', f: fADSR, q: 5, r$: osc1 }),
          padADSR = M$.ADSR({ a: 1, d: 0, s: 1, r: 1 }, voice),
          amp = M$.Gain({ g: padADSR, r$: filter })
      amp.$(voice)
      return voice
    },
    freq: 220,
    off: 0.7,
    rec: 3
  },
  peyow: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      const voice = M$.Voice(),
            slide1 = M$.ADSR({ a: 0.2, b: 5000, e: 220, s: 1, r: 0.1 }, voice),
            adsr = M$.ADSR({ D: 0, b: 0, e: 1, s: 1.8, a: 1, d: 1, r: 0.1, p: 0.1 }, voice),
            osc1 = M$.Osc({ t: M$.sine, f: slide1, S: 1, g: adsr }),
            compress = M$.Comp({ g: 1, k: 4, r$: osc1 })
      compress.$(voice)
      return voice
    },
    freq: 175,
    off: 0.5,
    rec: 1
  },
  chip: {
    fn: M$ => {
      let voice = M$.Voice({ g: 0.7 }),
          tone1 = M$.Osc({ t: M$.triangle, S: 1/2, g: 0.5 }),
          tone2 = M$.Pulse({ w: 2/16, o: 5/16, S: 1/2, g: 0.75 }),
          fADSR = M$.ADSR({ b: 2000, a: 0.1, e: 4000, d: 3, s: 2000, r: 4 }, voice),
          highpass = M$.Filt({ t: M$.highpass, q: 4, f: fADSR, r$: [tone1, tone2] }),
          lowpass = M$.Filt({ t: M$.lowpass, q: 0.2, f: 4000, r$: highpass }),
          ampADSR = M$.ADSR({ d: 3, s: 0.8, r: 0.1 }, voice),
          amp = M$.Gain({ g: ampADSR, r$: [tone1, tone2, lowpass] });
      voice.f.$(tone1.f)
      voice.f.$(tone2.f)
      amp.$(voice);
      return voice;
    },
    off: 2.2,
    rec: 2.3
  },
  hiHat: {
    fn: M$ => {
      // From Joe Sullivan: http://joesul.li/van/synthesizing-hi-hats/
      // NOTE: Currently does not respond to Voice frequency input.
      let fundamental = 40,
          ratios = [2, 3, 4.16, 5.43, 6.79, 8.21],
          bandFilter = M$.Filt({ t: M$.bandpass, q: 1, f: 10000 }),
          hiFilter = M$.Filt({ t: M$.highpass, q: 1, f: 7000, r$: bandFilter })
      ratios.forEach(ratio => M$.Osc({ t: M$.square, f: ratio * fundamental }).$(bandFilter))
      let voice = M$.Voice({ g: .5, r$: hiFilter })
      let adsrMod = M$.ADSR({ a: 0.01, e: 4, d: 0.05, s: 0 }, voice)
      adsrMod.$(hiFilter.g)
      return voice
    },
    rec: 0.1
  },
  pad1: {
    fn: M$ => {
      let voice = M$.Voice({a: 1.9}),
          // First oscillator will be a sawtooth:
          osc1 = M$.Osc({t: 'sawtooth', f: voice.f, g: 1, S: 1}),

          // Second square oscillator will be warbled slightly with a sinewave:
          lfo1 = M$.Gain({g: voice.f, r$: M$.Osc({t: 'sine', f: 6, g: 1/880})}),
          osc2 = M$.Osc({t: 'square', f: [voice.f, lfo1], g: 0.5, S: 1/2}),

          // Throw in this slightly detuned oscillator, too:
          osc2b = M$.Osc({t: 'square', f: [voice.f, lfo1], g: 0.4, d: 12, S: 1/2}),

          // Set up the filter frequency to swell over 4s, and also to slowly warble:
          fADSR = M$.ADSR({b: 300, a: 4, e: 4000, d: 3, s: 2000, r: 3}, voice),
          lfo2 = M$.Osc({t: 'sine', f: 4, g: 100}),
          filter = M$.Filt({t: 'lowpass', f: [fADSR, lfo2], q: 0.5, r$: [osc1, osc2, osc2b]}),

          // The final amp will fade in and out slowly:
          padADSR = M$.ADSR({a: 3, d: 0, s: 1, r: 1}, voice),
          amp = M$.Gain({g: padADSR, r$: filter}),

          // Add a reverb to smooth out the sound. If we had 2 channels, we'd get
          // some chorus effect, too.
          reverb = M$.Conv({b: M$.reverb(0.1, 1, 0.95), r$: amp, g: 5})

      reverb.$(voice)
      return voice
    },
    off: 0.5
  },
  kick: {
    fn: M$ => {
      // Note that this is rendered at a lower sample rate so that the end result is
      // pitched up. Try it at 9000, too!
      // NOTE: Currently does not respond to Voice frequency input.
      let noise = M$.Noise(),
          lfADSR = M$.ADSR({ b: 4000, a: 0.15, e: 10, d: 1, s: 370 }),
          lowFilter = M$.Filt({ t: M$.lowpass, q: 0.3, f: lfADSR, g: 1, r$: noise }),
          outGain = M$.Gain({ r$: lowFilter }),
          freqs = [50, 793, 990, 2685, 4672, 6941, 14609, 18526],
          qs = [2, 7, 10, 5, 10, 20, 5, 5],
          gains = [1, 0.5, 0.4, 0.3, 0.4, 0.5, 0.2, 0.1],
          fADSR = M$.ADSR({ a: 0.7, e: 200 }),
          aADSR0 = M$.ADSR({ d: 0.3, s: 0 }),
          aADSR = M$.ADSR({ d: 0.5, e: 0.2, s: 0.8 }),
          i, filter
      for (i = 0; i < freqs.length; i++) {
          filter = M$.Filt({ t: M$.bandpass, q: qs[i], f: freqs[i], g: gains[i], r$: noise })
          if (i == 0) {
              M$.C(gains[i]).$(filter.g)
              aADSR0.$(filter.g)
          }
          else if (i == 1 || i == 2 || i == 6) {
              M$.C(freqs[i]).$(filter.f)
              fADSR.$(filter.f)
          }
          else {
              M$.C(gains[i]).$(filter.g)
              aADSR.$(filter.g)
          }
          filter.$(outGain)
      }
      let voice = M$.Voice({ g: 1, r$: outGain })
      voice.rg(fADSR, aADSR, aADSR0, lfADSR)
      let adsrMod = voice.rg(M$.ADSR({ a: 0.01, d: 0.6, s: 0 }))
      adsrMod.$(outGain.g)
      return voice
    },
    rec: 1.8,
    sr: 11000
  },
  bell: {
    fn: M$ => {
      // Help from: https://www.soundonsound.com/techniques/synthesizing-bells
      let voice = M$.Voice(),
          fADSR = M$.ADSR({ a: 0.01, e: 2, p: 0.02, r: 1.5, b: 0.5 }, voice),
          fMult = M$.Gain({ g: fADSR, r$: voice.f }),
          filter = M$.Filt({ t: 'lowpass', g: 1, q: 1, f: fMult }),
          dADSR = M$.ADSR({ a: 0.01, e: 0.3, r: 0.8, p: 0.02 }, voice),
          distorter = M$.Dist({ a: 2, g: dADSR, r$: filter }),
          mADSR = M$.ADSR({ a: 0.01, r: 1.5, p: 0.02 }, voice),
          mAmp = M$.Gain({ g: mADSR, r$: filter }),
          harmonics = [0.5, 2, 3, 4.2, 5.4, 6.8]
      mAmp.$(voice)
      distorter.$(voice)
      harmonics.forEach(h => M$.Osc({ f: voice.f, S: h, t: 'triangle' }).$(filter))
      return voice
    },
    freq: 880,
    off: 2.3
  },
  foghornBass: {
    fn: M$ => {
      // Created by 7r1x/neuralyte
      let voice = M$.Voice(),
          carrier = M$.Osc({ t: M$.triangle, f: voice.f, S: 1/8, g: 1/4 }),
          fMult = M$.Gain({ g: voice.f, r$: carrier }),
          modulator = M$.Osc({ t: M$.sine, f: [voice.f, fMult], g: 1/2, S: 1/2 }),
          fADSR = M$.ADSR({ b: 0.05, a: 0.5, e: .4, d: 1, s: 0.5, r: 0.2 }, voice),
          fADSRMult = M$.Gain({ g: voice.f, r$: fADSR }),
          filter = M$.Filt({ t: M$.lowpass, q: 1, f: fADSRMult, r$: modulator }),
          distorter = M$.Dist({ a: 15, r$: filter }),
          loud = M$.Gain({ g:3, r$: distorter })
      loud.$(voice)
      M$.ADSR({r: 1}, voice).$(voice.g)
      return voice
    },
    freq: 440,
    off: 1.2,
    rec: 2.2
  },
  splash: {
    fn: M$ => {
      // Drawn from http://joesul.li/van/synthesizing-hi-hats/
      let fundamental = 20,
          ratios = [2, 3, 4.16, 5.43, 6.79, 8.21],
          fADSR1 = M$.ADSR({ a: 0.05, b: 2000, e: 10000, d: 0, s: 10000 }),
          fADSR2 = M$.ADSR({ a: 0.1, b: 200, e: 10000, d: 1, s: 5000 }),
          bandFilter = M$.Filt({ t: M$.bandpass, q: 0.02, f: fADSR1 }),
          hiFilter = M$.Filt({ t: M$.highpass, q: 0.02, f: fADSR2, r$: bandFilter }),
          reverb = M$.Conv({ b: M$.reverb(0, 0.5, 0), n: true, g: 10, r$: hiFilter })
      ratios.forEach(ratio => M$.Noise().$(M$.Filt({ t: M$.bandpass, f: ratio * fundamental, q: 0.2, g: 3 }).$(bandFilter)))
      let voice = M$.Voice({ g: 0.3, r$: reverb }),
          adsrMod = M$.ADSR({ a: 0.01, d: 1, s: 0 }, voice)
      adsrMod.$(hiFilter.g)
      voice.rg(fADSR1, fADSR2)
      return voice
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
  