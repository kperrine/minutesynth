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
    fn: m$ => {
      // Demonstrates creation of ADSR control on a simple tone
      const voice = m$.Voice()

      // Create ADSR and patch voice trigger into it:
      const adsr = m$.ADSR({ a: 0.2, d: 0.5, s: 0.3, r: 2 }, voice)
      
      // Finish up, using the Voice's frequency generator attribute:
      const osc = m$.Osc({ t: m$.Waveforms.SQUARE, f: voice.f, g: adsr })
      osc.$(voice)

      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicFM: {
    fn: m$ => {
      // Demonstrates FM synthesis
      // Here, we'll make our modules but not hook them up yet:
      const sinewave = m$.Osc({ t: m$.Waveforms.SINE }) // An always-on sine wave
      const squarewave = m$.Osc({ t: m$.Waveforms.SQUARE }) // An always-on square wave
      const envelope = m$.ADSR({ p: 0.05, r: 1 }) // Will control tone emit and fadeout
      const multResult = m$.Gain() // Multiples tones together for FM
      const voice = m$.Voice() // Output voice. Note that it has .f for frequency control.

      // Wire frequency controls and fade out controls:
      voice.f.$(sinewave.f) // Link voice frequency control to sine wave oscillator
      voice.$(envelope) // Allows the voice on/off to trigger the ADSR
      envelope.$(voice.g) // That then controls the voice's final gain
      const fourFifthFreq = m$.Gain({ g: 0.98, r$: voice.f }) // Make detuned freq.
      fourFifthFreq.$(squarewave.f) // Control the square wave oscillator

      // Now connect the audio routing of the modules:
      sinewave.$(multResult) // Connect sine wave to multiplier audio input
      squarewave.$(multResult.g) // And connect square wave to multiplier gain control
      multResult.$(voice) // The multiplier goes directly to the voice output

      // We are required to return the voice.
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicFilter: {
    fn: m$ => {
      var voice = m$.Voice(),
          noise = m$.Noise(),
          filter = m$.Filt({ t: m$.Filters.BANDPASS, q: 10, f: voice.f }),
          adsr = m$.ADSR({ s: 3 }, voice) // Default on/off, triggered
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
    fn: m$ => {
      var voice = m$.Voice(),
          adsr = m$.ADSR({}, voice), // Default on/off, triggered
          osc = m$.Osc({ t: m$.Waveforms.SQUARE, f: voice.f, g: adsr }),
          reverb = m$.Conv({ b: m$.reverb(0, 2, 0.95), r$: osc })
      reverb.$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 0.5
  },
  basicResonate: {
    fn: m$ => {
      // Resonance demo. Play at Octave 1 or 2
      let voice = m$.Voice(),
          adsr = m$.ADSR({}, voice), // Basic on/off
          osc1 = m$.Osc({ t: m$.Waveforms.SQUARE, f: voice.f, g: adsr }),
          osc2 = m$.Osc({ t: m$.Waveforms.TRIANGLE, f: voice.f, S: 1/2, g: adsr }),
      // Get a lowpass filter with high Q value to dip from 1000 to 150 then back to 2500:
      sweeper = m$.ADSR({ b: 1000, e: 150, s: 2500, a: 1.5, d: 8, r: 0.5 }, voice),
      lpFilter = m$.Filt({ t: m$.Filters.LOWPASS, q: 18, f: sweeper, g: 1/4 })
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
    fn: m$ => {
      // Bandpass filter sweeping up, using an ADSR
      let voice = m$.Voice(),
          adsr = m$.ADSR({}, voice), // Basic on/off
          squareWave = m$.Osc({ t: m$.Waveforms.SQUARE, f: voice.f, g: adsr }),
          // Go from 30 to 2000 Hz in 1 sec.:
          sweeper = m$.ADSR({ b: 30, e: 2000, s: 2000, a: 1, r: 0.5 }, voice),
          bpFilter = m$.Filt({ t: m$.Filters.BANDPASS, q: 5, f: sweeper })
      // Link square wave to our filter and then out to voice:
      squareWave.$(bpFilter).$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicLFO: {
    fn: m$ => {
      // Demonstrates LFO on a voice: a vibrato
      // Here are a couple of parameters
      const FREQ = 7 // 7 Hz LFO
      const AMOUNT = 50 // We'll calculate this Hz +/- AMOUNT at 440
      let voice = m$.Voice(),
          // Here's our LFO, oscillating from -1 to 1:
          lfo = m$.Osc({ t: m$.Waveforms.SINE, f: FREQ }),

          // We want the vibrato amplitude to be proportional to frequency.
          factor = m$.Gain({ g: AMOUNT / 440, r$: voice.f }),
          lfoScaled = m$.Gain({ g: factor, r$: lfo }),

          adsr = m$.ADSR({}, voice), // Basic on/off
          // Add our scaled LFO to the voice frequency:
          triWave = m$.Osc({ t: m$.Waveforms.TRIANGLE, f: [voice.f, lfoScaled], g: adsr })

      triWave.$(voice)
      return voice
    },
    freq: 440,
    rec: 4,
    off: 3
  },
  basicPortamento: {
    fn: m$ => {
      // Demonstration using a frequency controller to create a "sliding" effect
      let voice = m$.Voice(),
          adsr = m$.ADSR({}, voice),
          osc1 = m$.Osc({ t: m$.Waveforms.TRIANGLE, f: voice.f, g: adsr })
      voice.f.p = 1/2 // Set portamento to be a half-second
      osc1.$(voice)
      return voice
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
      const adsr = m$.ADSR({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
      const osc1 = m$.Osc({ t: m$.Waveforms.SINE, f: slide1, S: 1/2, g: adsr })
      const noiseADSR = m$.ADSR({ D: 0.4, b: 0, e: 0.01, s: 0.05, a: 1, d: 0.1, r: 0.1, p: 0 }, voice)
      const noise = m$.Noise({ g: noiseADSR })
      const distort = m$.Dist({ a: 4, r$: [osc1, noise], g: 4 })
      const filterADSR = m$.ADSR({ D: 0.01, b: 2000, e: 50, s: 3200, a: 0.4, d: 0.1, r: 0.5, p: 0 }, voice)
  
      const filter = m$.Filt({ t: m$.Filters.HIGHPASS, f: filterADSR, q: 10, g: 0.65, r$: distort })
      const compress = m$.Comp({ g: 4, k: 4, r$: filter })
  
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
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = m$.Voice()
      const slide1 = m$.ADSR({ a: 2, b: 146, e: 0.73, s: 1, r: 1 }, voice)
      const adsr = m$.ADSR({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
      const osc1 = m$.Osc({ t: m$.Waveforms.SINE, f: slide1, S: 1/2, g: adsr })
      const distort = m$.Dist({ a: 55, r$: osc1, g: 1 })
      const filterADSR = m$.ADSR({ D: 0.01, b: 1000, e: 100, s: 1000, a: 0.21, d: 0.1, r: 0.9, p: 0 }, voice) // change s for fun

      const filter = m$.Filt({ t: m$.Filters.HIGHPASS, f: filterADSR, q: 8, g: 0.65, r$: distort })
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
      const reverb = m$.Conv({ b: m$.reverb(0.1, 1, 0.95), r$: amp, g: 2 })
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
      let voice = m$.Voice(),
          slide1 = m$.ADSR({ a: 0.2, b: 146, e: 110, s: 110, r: 1 }, voice),

          // Let's scale slide such that we would drop 36 Hz if we played 110 Hz.
          factor = m$.Gain({ g: 36/110, r$: slide1 }),
          freqMod = m$.Gain({ g: factor, r$: voice.f }),

          // Make the voice:
          adsr = m$.ADSR({ D: 0, b: 0, e: 2, s: 1, a: 0.01, d: 0.3, r: 0.05, p: 0 }, voice)
          osc1 = m$.Osc({ t: m$.Waveforms.SINE, f: freqMod, S: 1/2, g: adsr }),

          // Other stuff:
          noiseADSR = adsr = m$.ADSR({ D: 0.6, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.1, p: 0 }, voice),
          noise = m$.Noise({ g: noiseADSR }),
          filter = m$.Filt({ t: m$.Filters.LOWPASS, f: 2800, q: 2, g: 1, r$: [osc1, noise] }),
          distort = m$.Dist({ a: 30, r$: filter, g: 1 }), // a = distort amount
          compress = m$.Comp({ k: 8, r$: distort })

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
    fn: m$ => {
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = m$.Voice(),
            adsr = m$.ADSR({ a: 0.0001, d: 0.02, s: 0 }, voice),
            noise = m$.Noise({ g: adsr }),
            filter = m$.Filt({ t: m$.Filters.BANDPASS, q: 0.8, f: 2000, r$: noise, g: 2 })
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
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = m$.Voice(),
            osc1 = m$.Osc({ t: m$.Waveforms.SINE, f: 50 }),
            distorter = m$.Dist({ a: 30, r$: osc1 }),
            filter = m$.Filt({ t: m$.Filters.HIGHPASS, q: 0.5, f: 3000, r$: distorter }),
              // Bring down f to your liking
            compressor = m$.Comp({ k: 0.5, g: 5, r$: filter }),
            reverb = m$.Conv({ b: m$.reverb(0.1, 1, 0.95), r$: compressor, g: 2 })
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
      // NOTE: Currently does not respond to Voice frequency input.
      const voice = m$.Voice(),
            noise = m$.Noise(),
            noiseGate = m$.Noise({ r: 0.001 }),
            gateDistort = m$.Dist({ a: 500, r$: noiseGate, g: 5 }),
            noiseGain = m$.Gain({ g: 0.5, r$: gateDistort }),
            filter = m$.Filt({ t: 'bandpass', q: 30, f: 2200, r$: noise,
                               g: [0.5, noiseGain] }),
            distorter = m$.Dist({ a: 50, r$: filter }),
            otherGate = m$.Osc({ t: 'square', f: 31, g: 0.5 }),
            otherGate2 = m$.Osc({ t: 'square', f: 13, g: 0.5 }),
            gateGain1 = m$.Gain({ g: [0.5, otherGate], r$: distorter }),
            gateGain2 = m$.Gain({ g: [0.7, otherGate2], r$: gateGain1 }),
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
      let voice = m$.Voice({ g: 1 }),
          osc1 = m$.Osc({ t: 'sawtooth', f: voice.f, g: 1, S: 1/2 }),
          fADSR = m$.ADSR({ b: 2, a: 5, e: 16000, d: 3, s: 10, r: 1 }, voice),
          filter = m$.Filt({ t: 'highpass', f: fADSR, q: 5, r$: osc1 }),
          padADSR = m$.ADSR({ a: 1, d: 0, s: 1, r: 1 }, voice),
          amp = m$.Gain({ g: padADSR, r$: filter })
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
            osc1 = m$.Osc({ t: m$.Waveforms.SINE, f: slide1, S: 1, g: adsr }),
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
          tone1 = m$.Osc({ t: m$.Waveforms.TRIANGLE, S: 1/2, g: 0.5 }),
          tone2 = m$.Pulse({ w: 2/16, o: 5/16, S: 1/2, g: 0.75 }),
          fADSR = m$.ADSR({ b: 2000, a: 0.1, e: 4000, d: 3, s: 2000, r: 4 }, voice),
          highpass = m$.Filt({ t: m$.Filters.HIGHPASS, q: 4, f: fADSR, r$: [tone1, tone2] }),
          lowpass = m$.Filt({ t: m$.Filters.LOWPASS, q: 0.2, f: 4000, r$: highpass }),
          ampADSR = m$.ADSR({ d: 3, s: 0.8, r: 0.1 }, voice),
          amp = m$.Gain({ g: ampADSR, r$: [tone1, tone2, lowpass] });
      voice.f.$(tone1.f)
      voice.f.$(tone2.f)
      amp.$(voice);
      return voice;
    },
    off: 2.2,
    rec: 2.3
  },
  hiHat: {
    fn: m$ => {
      // From Joe Sullivan: http://joesul.li/van/synthesizing-hi-hats/
      // NOTE: Currently does not respond to Voice frequency input.
      let fundamental = 40, // (Change to 800 for clanging sound)
          ratios = [2, 3, 4.16, 5.43, 6.79, 8.21],
          bandFilter = m$.Filt({ t: m$.Filters.BANDPASS, q: 1, f: 10000 }),
          hiFilter = m$.Filt({ t: m$.Filters.HIGHPASS, q: 1, f: 7000, r$: bandFilter })
      ratios.forEach(ratio => m$.Osc({ t: m$.Waveforms.SQUARE, f: ratio * fundamental }).$(bandFilter))
      let voice = m$.Voice({ g: .5, r$: hiFilter })
      let adsrMod = m$.ADSR({ a: 0.01, e: 4, d: 0.05, s: 0 }, voice)
      adsrMod.$(hiFilter.g)
      return voice
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

      reverb.$(voice)
      return voice
    },
    off: 0.5
  },
  handDrum: {
    fn: m$ => {
      // Result of playing around. Can use more tweaking.
      // NOTE: Currently does not respond to Voice frequency input.
      let noise = m$.Noise(),
          lfADSR = m$.ADSR({ b: 8000, a: 0.15, e: 5, d: 1, s: 400 }),
          lowFilter = m$.Filt({ t: m$.Filters.LOWPASS, q: 1, f: lfADSR, g: 1, r$: noise }),
          outGain = m$.Gain({ r$: lowFilter }),
          fADSR = m$.ADSR({ a: 0.7, e: 100 }),
          aADSR0 = m$.ADSR({ d: 0.3, s: 0 }),
          aADSR = m$.ADSR({ d: 0.5, e: 0.2, s: 0.8 }),
          filter = m$.Filt({ t: m$.Filters.BANDPASS, q: 100, f: 25, r$: noise })
      aADSR0.$(filter.g)
      filter.$(outGain)
      let voice = m$.Voice({ g: 1, r$: outGain })
      voice.rg(fADSR, aADSR, aADSR0, lfADSR)
      let adsrMod = voice.rg(m$.ADSR({ a: 0.01, d: 0.6, s: 0 }))
      adsrMod.$(outGain.g)
      return voice
    },
    rec: 1.8,
    sr: 11000
  },
  bell: {
    fn: m$ => {
      // Help from: https://www.soundonsound.com/techniques/synthesizing-bells
      let voice = m$.Voice(),
          fADSR = m$.ADSR({ a: 0.01, e: 2, p: 0.02, r: 1.5, b: 0.5 }, voice),
          fMult = m$.Gain({ g: fADSR, r$: voice.f }),
          filter = m$.Filt({ t: 'lowpass', g: 1, q: 1, f: fMult }),
          dADSR = m$.ADSR({ a: 0.01, e: 0.3, r: 0.8, p: 0.02 }, voice),
          distorter = m$.Dist({ a: 2, g: dADSR, r$: filter }),
          mADSR = m$.ADSR({ a: 0.01, r: 1.5, p: 0.02 }, voice),
          mAmp = m$.Gain({ g: mADSR, r$: filter }),
          harmonics = [0.5, 2, 3, 4.2, 5.4, 6.8]
      mAmp.$(voice)
      distorter.$(voice)
      harmonics.forEach(h => m$.Osc({ f: voice.f, S: h, t: 'triangle' }).$(filter))
      return voice
    },
    freq: 880,
    off: 2.3
  },
  foghornBass: {
    fn: m$ => {
      // Created by 7r1x/neuralyte
      let voice = m$.Voice(),
          carrier = m$.Osc({ t: m$.Waveforms.TRIANGLE, f: voice.f, S: 1/8, g: 1/4 }),
          fMult = m$.Gain({ g: voice.f, r$: carrier }),
          modulator = m$.Osc({ t: m$.Waveforms.SINE, f: [voice.f, fMult], g: 1/2, S: 1/2 }),
          fADSR = m$.ADSR({ b: 0.05, a: 0.5, e: .4, d: 1, s: 0.5, r: 0.2 }, voice),
          fADSRMult = m$.Gain({ g: voice.f, r$: fADSR }),
          filter = m$.Filt({ t: m$.Filters.LOWPASS, q: 1, f: fADSRMult, r$: modulator }),
          distorter = m$.Dist({ a: 15, r$: filter }),
          loud = m$.Gain({ g: 3, r$: distorter })
      loud.$(voice)
      m$.ADSR({r: 1}, voice).$(voice.g)
      return voice
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
          fADSR1 = m$.ADSR({ a: 0.05, b: 2000, e: 10000, d: 0, s: 10000 }),
          fADSR2 = m$.ADSR({ a: 0.1, b: 200, e: 10000, d: 1, s: 5000 }),
          bandFilter = m$.Filt({ t: m$.Filters.BANDPASS, q: 0.02, f: fADSR1 }),
          hiFilter = m$.Filt({ t: m$.Filters.HIGHPASS, q: 0.02, f: fADSR2, r$: bandFilter }),
          reverb = m$.Conv({ b: m$.reverb(0, 0.5, 0), n: true, g: 10, r$: hiFilter })
      ratios.forEach(ratio => m$.Noise().$(m$.Filt({ t: m$.Filters.BANDPASS, f: ratio * fundamental, q: 0.2, g: 3 }).$(bandFilter)))
      let voice = m$.Voice({ g: 0.3, r$: reverb }),
          adsrMod = m$.ADSR({ a: 0.01, d: 1, s: 0 }, voice)
      adsrMod.$(hiFilter.g)
      voice.rg(fADSR1, fADSR2)
      return voice
    },
    off: .8,
    rec: 2
  },
  program: {
    fn: m$ => {
      // Example of a triggered, programmed series of values. Note that this
      // is not a recommended way to create a sequencer (e.g. you can't trigger
      // an ADSR for each frequency value produced), but it is a great way
      // to do things like arpeggios.

      // Natural and sharp notes for working up frequencies:
      const NOTES = { cN: 0, cS: 1, dN: 2, dS: 3, eN: 4, fN: 5, fS: 6,
          gN: 7, gS: 8, aN: 9, aS: 10, bN: 11, cH: 12 }
      const WHOLE_DUR = 0.5 // Duration for a whole note in seconds
      const getFreqBase = (octave, offset) => 2**(((octave - 4) * 12 + offset) / 12)

      // Our return object with trigger:
      const voice = m$.Voice({ g: 0.7 })

      // Resources for programmed frequencies:
      const TONES = [
          { freq: NOTES.cN, oct: 3, dur: 1/4 },
          { freq: NOTES.eN, oct: 3, dur: 1/4 },
          { freq: NOTES.cN, oct: 3, dur: 1/4 },
          { freq: NOTES.gN, oct: 3, dur: 1/4 },
          { freq: NOTES.cN, oct: 3, dur: 1/4 },
          { freq: NOTES.cN, oct: 4, dur: 1/4 },
          { freq: NOTES.bN, oct: 3, dur: 1/8 },
          { freq: NOTES.aN, oct: 3, dur: 1/8 },
          { freq: NOTES.gN, oct: 3, dur: 1/8 },
          { freq: NOTES.aN, oct: 3, dur: 1/8 },
          { freq: NOTES.gN, oct: 3, dur: 1/8 },
          { freq: NOTES.fN, oct: 3, dur: 1/8 },
          { freq: NOTES.eN, oct: 3, dur: 1/8 },
          { freq: NOTES.fN, oct: 3, dur: 1/8 },
          { freq: NOTES.eN, oct: 3, dur: 1/8 },
          { freq: NOTES.dN, oct: 3, dur: 1/8 },
          { freq: NOTES.cN, oct: 3, dur: 1/2 }
      ]
      let timePoint = -TONES[0].dur
      const program = m$.Prog({
          v: [ // Record all values; in this case, "frequency base" to signify note.
              // Each "frequency base" will be multiplied below by the voice frequency
              // generator to transpose to the key desired.
              ...TONES.map(elem => getFreqBase(elem.oct, elem.freq))
          ],
          t: [ // Times to set all value changes:
              ...TONES.map(elem => timePoint += elem.dur * WHOLE_DUR),
          ]
          // HINT: Add "p" parameter (e.g. p: 0.05) to glide between values!
      })

      // Resources for tone generation:
      // First, we get our final frequency by multiplying the program's "frequency base"
      // value with the frequency generator attached to voice.
      const adjFreq = m$.Gain({ r$: program, g: voice.f })

      // Next, tone generation, etc.
      const tone = m$.Osc({ t: m$.Waveforms.TRIANGLE, f: adjFreq, g: 0.5 })
      const adsr = m$.ADSR({ d: 5, s: 0 }, voice) // Quick onset, slow decay
      const amp = m$.Gain({ r$: tone, g: adsr })
      amp.$(voice) // Plug amp output into voice
      voice.$(program) // Voice object triggers the program

      return voice
    },
    off: 5,
    rec: 5
  },
  engine: {
    fn: m$ => {
      const voice = m$.Voice()
      const amp = m$.Gain()
      for (let i = 0; i < 20; i++) {
        // TODO: Put in a mathy way of producing freqs deterministically, likely involving a modulo:
        let osc = m$.Osc({ t: m$.Waveforms.SAWTOOTH, f: Math.random() * 1170 + 30, g: Math.random() * 0.2 + 0.1 })
        osc.$(amp)
      }
      const adsr = m$.ADSR({ b: 100, a: 8, e: 800, s: 1000, d: 6 }, voice)
      const filter = m$.Filt({ t: m$.Filters.BANDPASS, q: 10, f: adsr, S: 2, g: 3, r$: amp })
      const finalAmp = m$.Gain({ g: m$.ADSR({ b: 0.1, a: 6 }, voice), r$: filter })
      finalAmp.$(voice)
      return voice
    },
    off: 10,
    rec: 10
  },
  zzFx: {
    fn: async function(m$) {
      // Example of using Frank Force's ZzFx generation output as a source
      // within the MinuteSynth framework. First, here is a copy of the
      // ZzFxMicro.min.js code that you would typically include in your HTML:
      // -----
      let // ZzFXMicro - Zuper Zmall Zound Zynth - v1.3.2 by Frank Force
      zzfxV=.3,               // volume
      zzfxX=new AudioContext, // audio context
      zzfx=                   // play sound
      (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0,N=0)=>{let M=Math,d=2*M.PI,R=44100,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0,J=0,f=0,h=N<0?-1:1,x=d*h*N*2/R,L=M.cos(x),Z=M.sin,K=Z(x)/4,O=1+K,X=-2*L/O,Y=(1-K)/O,P=(1+h*L)/2/O,Q=-(h+L)/O,S=P,T=0,U=0,V=0,W=0;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;p*=zzfxV;for(h=e+m+r+t+c|0;a<h;k[a++]=f*p)++J%(100*F|0)||(f=q?1<q?2<q?3<q?4<q?(g/d%1<D/2)*2-1:Z(g**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):Z(g),f=(l?1-B+B*Z(d*a/l):1)*(4<q?s:(f<0?-1:1)*M.abs(f)**D)*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2/p):f,N?f=W=S*T+Q*(T=U)+P*(U=f)-Y*V-X*(V=W):0),x=(b+=u+=y)*M.cos(A*H++),g+=x+x*E*Z(a**5),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1);X=zzfxX,p=X.createBuffer(1,h,R);p.getChannelData(0).set(k);b=X.createBufferSource();b.buffer=p;b.connect(X.destination);b.start()}
      // -----

      // Now, after including that stuff above, replace the AudioContext for buffering:
      const DUR_SECONDS = 1.1
      const ZZ_FREQ = 220
      zzfxX = new OfflineAudioContext(1, ~~(m$.ac.sampleRate * DUR_SECONDS), m$.ac.sampleRate)

      // Run a ZzFx call that I made in https://killedbyapixel.github.io/ZzFX/
      zzfx(...[.8,.1,ZZ_FREQ,.01,.19,.35,2,2.3,,,,,,.1,1,,,,,.25,16])

      // Grab buffer contents and run with it:
      const renderedBuffer = await zzfxX.startRendering()
      const srcBuf = renderedBuffer.getChannelData(0)
      // (It could have also been possible to create a special version of ZzFx that
      // allows me access to the generated buffer "k")

      // At this time, I'll set up my MinuteSynth stuff, but it can be done anywhere:
      const tgtBuf = m$.Buf({ T: DUR_SECONDS, S: 1 / ZZ_FREQ, n: 1 })
      const mem = tgtBuf.mem()
      const bufLen = Math.min(srcBuf.length, mem.length)
      for (let i = 0; i < bufLen; i++) {
        mem[i] = srcBuf[i]
      }

      // Set up output voice, and connect my MinuteSynth module buffer to it:
      const voice = m$.Voice()
      voice.rg(tgtBuf)
      voice.f.$(tgtBuf.f) // Hook up frequency control, too
      tgtBuf.$(voice)
      return voice
    },
    off: 2,
    rec: 2
  },
}

if (typeof module !== 'undefined') {
  module.exports = {
    ToneDefs
  }
}
  