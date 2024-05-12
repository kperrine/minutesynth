/* tonedef.js: A palette of tone definitions that are candidates for sample replacement */

// Each ToneDef shall be an object that fits this:
//   fn: function that takes a USynth object and return a Voice.
//   off: Time that voice is to be shut off, or 0 if record duration.
//   rec: Desired record duration. (Keep it 4.68 or less to fit within MOD specs unless
//      sample rate is decreased.
//   freq: Recording tone frequency (default: 440 Hz)
//   sr: Sample rate override-- forces sampling at given rate
//   chan: Number of channels to record. Default: 1
const ToneDefs = {
    cowbell: {
      fn: U => {
        // From http://outputchannel.com/post/tr-808-cowbell-web-audio/
        const voice = U.V()
        const osc1 = U.O({ t: 2 /* 'square' */, f: voice.f })
        const osc2 = U.O({ t: 2 /* 'square' */, f: voice.f, S: 800 / 540 })
        const adsr = U.A({ a: 0.01, p: 0.01, r: 0.1 }, voice)
        const filter = U.Q({ t: 3 /* 'bandpass' */, f: 350, q: 1, g: adsr, r$: [osc1, osc2] })
        filter.$(voice)
        return voice
      },
      freq: 660,
      rec: 0.3,
      off: 0.15
    },
    // reese: {
    //   fn: U => {
    //     const voice = U.V()
    //     const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 4 })
    //     const osc2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 2 })
    //     const unison1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 2.05, g: 0.4 })
    //     const unison2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1.95, g: 0.4 })
    //     const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1 / 8 })
    //     const adsr = U.A({ a: 0.01, p: 3, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: voice.f, q: 3, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 130.813,
    //   rec: 1,
    //   off: 0.9
    // },
    // // https://www.liutaiomottola.com/formulae/freqtab.htm
    // reese2: {
    //   fn: U => {
    //     const voice = U.V()
    //     const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 4, g: 0.6 })
    //     const osc2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 2, g: 0.9 })
    //     const unison1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 2.03, g: 0.2 })
    //     const unison2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1.97, g: 0.2 })
    //     const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1 / 8, g: 0.9 })
    //     const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 120, q: 2, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 130.813, // C-3
    //   rec: 2,
    //   off: 2
    // },
    // // LUVVERLY RENEGADE STYLE!!!
    // // https://www.youtube.com/watch?v=XkmWy2XZI_Y
    // // night flight
    // // https://www.youtube.com/watch?v=-vbnxrccBQQ
    // // deep blue
    // reese3: {
    //   fn: U => {
    //     const voice = U.V()
    //     const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.8 })
    //     const osc2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1, g: 0.9 })
    //     const unison1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1.03, g: 0.2 })
    //     const unison2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 0.97, g: 0.2 })
    //     const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f / 2, S: 1, g: 0.95 })
    //     const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 200, q: 2, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 175, // C-3
    //   rec: 2,
    //   off: 2
    // },
    // reese4: {
    //   fn: U => {
    //     const voice = U.V()
    //     const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.6 })
    //     const osc2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1, g: 0.8 })
    //     const unison1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1.02, g: 0.2 })
    //     const unison2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 0.98, g: 0.2 })
    //     const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1, g: 0.9 })
    //     const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 140, q: 3, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 110,
    //   rec: 2,
    //   off: 2
    // },
    // organy: {
    //   fn: U => {
    //     const voice = U.V()
    //     const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.6 })
    //     // try S: 4
    //     const osc2 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 3, g: 0.8 })
    //     const unison1 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 3.02, g: 0.2 })
    //     const unison2 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 3.98, g: 0.2 })
    //     const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1, g: 0.9 })
    //     const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 200, q: 3, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 110,
    //   rec: 2,
    //   off: 2
    // },
    // reese5: {
    //   fn: U => {
    //     const voice = U.V()
    //     const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.5 })
    //     const osc2 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 2, g: 0.2 })
    //     const unison1 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 2.05, g: 0.1 })
    //     const unison2 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1.95, g: 0.1 })
    //     const unison3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 2.10, g: 0.05 })
    //     const unison4 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1.90, g: 0.05 })
    //     const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1, g: 0.7 })
    //     const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 250, q: 2, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2, unison3, unison4] })
    //     const compress = U.R({ k: 1, r$: filter })
    //     filter.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 110,
    //   rec: 2,
    //   off: 2
    // },
    // reese6: {
    //   fn: U => {
    //     const u = []; const voice = U.V()
    //     for (var n = 10, s = 0.05, S = 2; n > -1; n--) {
    //       const a = n * s
    //       const g = (1 / (n + 1)) / 10
    //       console.log(n, a, (1 / (n + 1)) / 10)
    //       u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S + a, g: g }))
    //       if (n)u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S - a, g: g }))
    //     }
    //     const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.3 })
    //     const osc2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 2, g: 0.2 })
    //     // unison1 = U.O({t: 'saw', f: voice.f, S: 2.05, g:0.1}),
    //     // unison2 = U.O({t: 'saw', f: voice.f, S: 1.95, g:0.1}),
    //     // unison3 = U.O({t: 'saw', f: voice.f, S: 2.10, g:0.05}),
    //     // unison4 = U.O({t: 'saw', f: voice.f, S: 1.90, g:0.05}),
    //     const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1, g: 0.7 })
    //     const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 250, q: 2, g: adsr, r$: [osc1, osc2, osc3, ...u] })
    //     const compress = U.R({ k: 1, r$: filter })
    //     filter.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 110,
    //   rec: 2,
    //   off: 2
    // },
    // reese7: {
    //   fn: U => {
    //     const u = []; const voice = U.V()
    //     for (var n = 2, s = 0.02, S = 2; n > -1; n--) {
    //       const a = n * s
    //       const g = (1 / (n + 1)) / 10
    //       console.log(n, a, (1 / (n + 1)) / 10)
    //       u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S + a, g: g }))
    //       if (n)u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S - a, g: g }))
    //     }
    //     const sq = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.9 })
    //     const si = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1 / 2, g: 0.9 })
    //     const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 150, q: 3, g: adsr, r$: [sq, si, ...u] })
    //     const compress = U.R({ k: 1, r$: filter })
    //     filter.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 110,
    //   rec: 2,
    //   off: 2
    // },
    // reese8: {
    //   fn: U => {
    //     const u = []; const voice = U.V()
    //     for (var n = 2, s = 0.05, S = 2; n > -1; n--) {
    //       const a = n * s
    //       const g = (1 / (n + 1)) / 4
    //       console.log(n, a, (1 / (n + 1)) / 10)
    //       u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S + a, g: g }))
    //       if (n)u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S - a, g: g }))
    //     }
    //     const sq = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.6 })
    //     const si = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1, g: 0.3 })
    //     const adsr = U.A({ a: 0.01, p: 1, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 220, q: 3, g: adsr, r$: [sq, si, ...u] })
    //     const distort = U.D({ a: 4, r$: filter, g: 1 }) // a = distort amount
    //     const compress = U.R({ k: 1, r$: distort })
    //     filter.$(voice)
    //     distort.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 110,
    //   rec: 2,
    //   off: 2
    // },
    // reese9: {
    //   fn: U => {
    //     const u = []; const voice = U.V()
    //     for (var n = 4, s = 0.025, S = 2; n > -1; n--) {
    //       const a = n * s
    //       const g = (1 / (n + 1)) / 6
    //       console.log(n, a, (1 / (n + 1)) / 20)
    //       u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S + a, g: g }))
    //       if (n)u.push(U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: S - a, g: g }))
    //     }
    //     const sq = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.6 })
    //     const si = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1, g: 0.3 })
    //     const adsr = U.A({ a: 0.01, p: 1, r: 0.1 }, voice)
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 160, q: 3, g: adsr, r$: [sq, si, ...u] })
    //     const distort = U.D({ a: 3, r$: filter, g: 5 }) // a = distort amount
    //     const compress = U.R({ k: 1, r$: distort })
    //     filter.$(voice)
    //     distort.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 110,
    //   rec: 2,
    //   off: 2
    // },
    reese10: {
      fn: U => {
        const voice = U.V()
        const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.8 })
        const osc2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1, g: 0.9 })
        const unison1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1.03, g: 0.2 })
        const unison2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 0.97, g: 0.2 })
        const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f / 2, S: 1, g: 0.95 })
        const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
        const distort = U.D({ a: 0.1, r$: [osc1, osc2, osc3, unison1, unison2], g: 1 })
        const filter = U.Q({ t: 1/* 'lowpass' */, f: 250, q: 0, g: adsr, r$: [distort] })
        const compress = U.R({ g: 5, k: 2, r$: filter })
  
        compress.$(voice)
        return voice
      },
      freq: 175, // C-3
      rec: 2,
      off: 2
    },
    //   reese11: {
    //     fn: U => {
    //       const voice = U.V()
    //       const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.8 })
    //       const osc2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1, g: 0.9 })
    //       const unison1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 2.03, g: 0.2 })
    //       const unison2 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, S: 1.97, g: 0.2 })
    //       const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f / 2, S: 1, g: 0.95 })
    //       const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //       const distort = U.D({ a: 0.1, r$: [osc1, osc2, osc3, unison1, unison2], g: 1 })
    //       const filter = U.Q({ t: 1/* 'lowpass' */, f: 350, q: 0, g: adsr, r$: [distort] })
    //       const compress = U.R({ g: 5, k: 2, r$: filter })
    //
    //       compress.$(voice)
    //       return voice
    //     },
    //     freq: 175, // C-3
    //     rec: 2,
    //     off: 2
    //   },
    //   octane: {
    //     fn: U => {
    //       const voice = U.V()
    //       const osc1 = U.O({ t: 2/* 'square' */, f: voice.f, S: 1 / 2, g: 0.4 })
    //       // try S: 4
    //       const osc2 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 3, g: 0.5 })
    //       const unison1 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 3.02, g: 0.2 })
    //       const unison2 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 3.98, g: 0.2 })
    //       const osc3 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1, g: 0.9 })
    //       const adsr = U.A({ a: 0.01, p: 1.8, r: 0.1 }, voice)
    //       const filter = U.Q({ t: 1/* 'lowpass' */, f: 200, q: 3, g: adsr, r$: [osc1, osc2, osc3, unison1, unison2] })
    //       filter.$(voice)
    //       return voice
    //       /*
    //
    //       var voice = U.V(),
    //         osc1 = U.O({t: 'square', f: voice.f, S: 1/2, g:.4}),
    //         // try S: 4
    //         osc2 = U.O({t: 'sine', f: voice.f, S: 3, g:.5}),
    //         unison1 = U.O({t: 'sine', f: voice.f, S: 3.02, g:0.2}),
    //         unison2 = U.O({t: 'sine', f: voice.f, S: 3.98, g:0.2}),
    //         osc3 = U.O({t: 'sine', f: voice.f, S: 1, g:.9}),
    //         adsr = U.A({a: 0.01, p: 1.8, r: 0.1}, voice),
    //         filter = U.Q({t: 'lowpass', f: 200, q: 3, g: adsr, r$: [osc1, osc2,osc3,unison1,unison2]}),
    // distort = U.D({a: 3, r$: filter, g:2});
    // distort.$(voice);
    //       filter.$(voice);
    //       return voice;
    // */
    //     },
    //     freq: 165, // E-3
    //     rec: 2,
    //     off: 2
    //   },
    //   helicopter: {
    //     fn: U => {
    //       const voice = U.V()
    //       const noise = U.N({ g: 3 })
    //       const lfo = U.O({ t: 1/* 'sine' */, f: 15, g: 1500 })
    //       const filter = U.Q({ t: 1/* 'lowpass' */, f: [lfo], q: 2, r$: [noise] })
    //
    //       filter.$(voice)
    //       return voice
    //     },
    //     freq: 165, // E-3
    //     rec: 2,
    //     off: 2
    //   },
    //   helicopterFade: {
    //     fn: U => {
    //       const voice = U.V()
    //       const noise = U.N({ g: 3 })
    //       const lfo = U.O({ t: 1/* 'sine' */, f: 15, g: 1500 })
    //       const adsr = U.A({ a: 1, p: 3, e: 1, s: 1, r: 2 }, voice)
    //       const filter = U.Q({ t: 1/* 'lowpass' */, f: [lfo], g: adsr, q: 2, r$: [noise] })
    //
    //       filter.$(voice)
    //       return voice
    //     },
    //     freq: 165, // E-3
    //     rec: 8,
    //     off: 5
    //   },
    //
    //   // The default ADSR lets the tone stay on until it is shut off.
    //   // D: start delay for attack
    //   // b: base value (= "off" value)
    //   // e: attack arrival value
    //   // a: attack time (time to go from b to e)
    //   // d: decay time (time to go from e to s)
    //   // s: sustain value (after the attack-decay sequence
    //   // r: release time (from s to b, occurring when triggerOff() is called)
    //   // p: auto-pulse-- if nonzero, automatically does a triggerOff p seconds after triggerOn.
    //
    //   b_clean808bass: {
    //     fn: U => {
    //       const voice = U.V()
    //       const adsr = U.A({ D: 0, b: 0, e: 2, a: 0.03, d: 0.4, s: 1, r: 1, p: 0 }, voice)
    //       const osc1 = U.O({ t: 1/* 'sine' */, f: voice.f, S: 1 / 2, g: adsr })
    //       // noiseADSR = U.A({a: 0.01, p: 1.8, r: 0.1}, voice),
    //       // noise = U.N({g: noiseADSR}),
    //       const filter = U.Q({ t: 1/* 'lowpass' */, f: 1200, q: 2, g: 1, r$: [osc1] })
    //
    //       filter.$(voice)
    //       return voice
    //     },
    //     freq: 175,
    //     off: 1.2,
    //     rec: 3
    //   },
    // b_optical: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 1, b: 146, e: 110, s: 110, r: 10 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2, s: 1, a: 0.03, d: 0.1, r: 0.5, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 1, d: 0.1, r: 0.1, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 4400, q: 2, g: 1, r$: [osc1, noise] })
    //     const distort = U.D({ a: 3, r$: filter, g: 1 }) // a = distort amount
    //     const compress = U.R({ k: 1, r$: distort })
    //
    //     filter.$(voice)
    //     distort.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1.2,
    //   rec: 3
    // },
    // c_optical: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 1, b: 146, e: 110, s: 110, r: 10 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2, s: 1, a: 0.03, d: 0.1, r: 0.5, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.1, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 3000, q: 2, g: 1, r$: [osc1, noise] })
    //     const distort = U.D({ a: 2, r$: filter, g: 1 }) // a = distort amount
    //     const compress = U.R({ k: 1, r$: distort })
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1.2,
    //   rec: 3
    // },
    // d_optical: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 1, b: 146, e: 110, s: 110, r: 110 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const distort = U.D({ a: 4, r$: [osc1, noise], g: 4 })
    //     const filterADSR = adsr = U.A({ D: 0.01, b: 5000, e: 50, s: 10000, a: 0.5, d: 0.1, r: 0.3, p: 0 }, voice)
    //
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: filterADSR, q: 2, g: 1, r$: distort })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1.2,
    //   rec: 3
    // },
    // e_optical: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 2, b: 146, e: 110, s: 110, r: 1 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const distort = U.D({ a: 4, r$: [osc1, noise], g: 4 })
    //     const filterADSR = adsr = U.A({ D: 0.01, b: 1000, e: 50, s: 10000, a: 0.5, d: 0.1, r: 0.3, p: 0 }, voice)
    //
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: filterADSR, q: 2, g: 1, r$: distort })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1.2,
    //   rec: 3
    // },
    // f_optical: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 2, b: 146, e: 78, s: 390, r: 1 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.4, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const distort = U.D({ a: 4, r$: [osc1, noise], g: 4 })
    //     const filterADSR = adsr = U.A({ D: 0.01, b: 1000, e: 50, s: 3000, a: 0.5, d: 0.1, r: 0.3, p: 0 }, voice)
    //
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: filterADSR, q: 3, g: 1, r$: distort })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1.305,
    //   rec: 3
    // },
    // g_optical: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 2, b: 146, e: 78, s: 390, r: 1 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.4, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const distort = U.D({ a: 4, r$: [osc1, noise], g: 4 })
    //     const filterADSR = adsr = U.A({ D: 0.01, b: 1000, e: 50, s: 3000, a: 0.5, d: 0.1, r: 0.3, p: 0 }, voice)
    //
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: filterADSR, q: 10, g: 0.65, r$: distort })
    //     const compress = U.R({ g: 4, k: 4, r$: filter })
    //
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1.301,
    //   rec: 3
    // },
    h_optical: {
      fn: U => {
        const voice = U.V()
        const slide1 = U.A({ a: 2, b: 146, e: 78, s: 390, r: 1 }, voice)
        var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
        const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
        const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.05, a: 1, d: 0.1, r: 0.1, p: 0 }, voice)
        const noise = U.N({ g: noiseADSR })
        const distort = U.D({ a: 4, r$: [osc1, noise], g: 4 })
        const filterADSR = adsr = U.A({ D: 0.01, b: 2000, e: 50, s: 3200, a: 0.4, d: 0.1, r: 0.5, p: 0 }, voice)
  
        const filter = U.Q({ t: 2/* 'highpass' */, f: filterADSR, q: 10, g: 0.65, r$: distort })
        const compress = U.R({ g: 4, k: 4, r$: filter })
  
        compress.$(voice)
        compress.$(voice)
        return voice
      },
      freq: 175,
      off: 1.301,
      rec: 3
    },
    i_optical: {
      fn: U => {
        const voice = U.V()
        const slide1 = U.A({ a: 2, b: 146, e: 78, s: 390, r: 1 }, voice)
        var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
        const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
        const noiseADSR = adsr = U.A({ D: 0.5, b: 0, e: 0.01, s: 0.05, a: 1, d: 0.1, r: 0.1, p: 0 }, voice)
        const noise = U.N({ g: noiseADSR })
        const distort = U.D({ a: 4, r$: [osc1, noise], g: 4 })
        const filterADSR = adsr = U.A({ D: 0.01, b: 3000, e: 50, s: 4500, a: 0.4, d: 0.2, r: 0.1, p: 0 }, voice)
  
        const filter = U.Q({ t: 2/* 'highpass' */, f: filterADSR, q: 10, g: 0.65, r$: distort })
        const compress = U.R({ g: 4, k: 4, r$: filter })
  
        compress.$(voice)
        compress.$(voice)
        return voice
      },
      freq: 175,
      off: 1.301,
      rec: 3
    },
    // a_optical: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 2, b: 146, e: 0.73, s: 1, r: 1 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.01, a: 0.9, d: 0.1, r: 0.4, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const distort = U.D({ a: 55, r$: [osc1, noise], g: 1 })
    //     const filterADSR = adsr = U.A({ D: 0.01, b: 1000, e: 100, s: 2200, a: 0.21, d: 0.1, r: 0.1, p: 0 }, voice) // change s for fun
    //
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: filterADSR, q: 22, g: 0.65, r$: distort })
    //     const compress = U.R({ g: 4, k: 4, r$: filter })
    //
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1.301,
    //   rec: 3
    // },
    rubberband: {
      fn: U => {
        const voice = U.V()
        const slide1 = U.A({ a: 2, b: 146, e: 0.73, s: 1, r: 1 }, voice)
        var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.03, d: 0.1, r: 0.1, p: 0 }, voice)
        const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
        const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.01, a: 0.9, d: 0.1, r: 0.4, p: 0 }, voice)
        const noise = U.N({ g: noiseADSR })
        const distort = U.D({ a: 55, r$: [osc1/*, noise */], g: 1 })
        const filterADSR = adsr = U.A({ D: 0.01, b: 1000, e: 100, s: 1000, a: 0.21, d: 0.1, r: 0.9, p: 0 }, voice) // change s for fun
  
        const filter = U.Q({ t: 2/* 'highpass' */, f: filterADSR, q: 8, g: 0.65, r$: distort })
        const compress = U.R({ g: 4, k: 4, r$: filter })
  
        compress.$(voice)
        return voice
      },
      freq: 175,
      off: 1.301,
      rec: 3
    },
    // paddy: {
    //   fn: U => {
    //     const voice = U.V({ g: 0.8 })
    //     const osc1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, g: 1, S: 1 / 2 })
    //     const osc1b = U.O({ t: 3/* 'sawtooth' */, f: voice.f, g: 0.5, d: 14, S: 1 / 2 })
    //     const lfo1 = U.G({ g: voice.f, r$: U.O({ t: 1 /* 'sine' */, f: 4, g: 1 / 880 }) })
    //     const osc2 = U.O({ t: 3/* 'sawtooth' */, f: [voice.f, lfo1], g: 0.6, d: -12, S: 1 / 2 })
    //     const fADSR = U.A({ b: 100, a: 1, e: 4000, d: 3, s: 100, r: 3 }, voice)
    //     const lfo2 = U.O({ t: 2, f: 3, g: 100 })
    //     const filter = U.Q({ t: 2/* 'highpass' */, f: [fADSR, lfo2], q: 1, r$: [osc1, osc1b, osc2] })
    //     const padADSR = U.A({ a: 1.5, d: 0, s: 1.5, r: 1.3 }, voice)
    //     const amp = U.G({ g: padADSR, r$: filter })
    //     const reverb = U.K({ b: U.sr(0.1, 1, 0.95), r$: amp, g: 2 })
    //     reverb.$(voice)
    //     return voice
    //   },
    //   freq: 440,
    //   off: 0.5,
    //   rec: 3
    // },
    // paddy2: {
    //   fn: U => {
    //     const voice = U.V({ g: 1 })
    //     const osc1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, g: 1, S: 1 })
    //     const osc1b = U.O({ t: 3/* 'sawtooth' */, f: voice.f, g: 0.7, d: 14, S: 9 / 12 })
    //     const lfo1 = U.G({ g: voice.f, r$: U.O({ t: 1 /* 'sine' */, f: 4, g: 1 / 440 }) })
    //     const osc2 = U.O({ t: 3/* 'sawtooth' */, f: [voice.f, lfo1], g: 0.8, d: -12, S: 6 / 12 })
    //     const fADSR = U.A({ b: 100, a: 1, e: 8000, d: 3, s: 100, r: 3 }, voice)
    //     const lfo2 = U.O({ t: 2, f: 3, g: 100 })
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: [fADSR, lfo2], q: 1, r$: [osc1, osc1b, osc2] })
    //     const padADSR = U.A({ a: 1.5, d: 0, s: 1.5, r: 1.3 }, voice)
    //     const amp = U.G({ g: padADSR, r$: filter })
    //     const reverb = U.K({ b: U.sr(0.1, 1, 0.95), r$: amp, g: 2 })
    //     reverb.$(voice)
    //     // amp.$(voice)
    //     return voice
    //   },
    //   freq: 440,
    //   off: 0.5,
    //   rec: 3
    // },
    paddy3: {
      fn: U => {
        const voice = U.V({ g: 3 })
        const lfo1 = U.G({ g: voice.f, r$: U.O({ t: 1 /* 'sine' */, f: 2, g: 1 / 440 }) })
        const osc1 = U.O({ t: 4/* 'triangle' */, f: [voice.f, lfo1], g: 1, S: 16 / 12 })
        const osc1b = U.O({ t: 4/* 'triangle' */, f: [voice.f, lfo1], g: 1, d: 14, S: 19 / 12 })
        const osc2 = U.O({ t: 4/* 'triangle' */, f: [voice.f, lfo1], g: 1, d: -12, S: 19 / 12 })
        const fADSR = U.A({ b: 500, a: 1, e: 1200, d: 4, s: 100, r: 2 }, voice)
        const lfo2 = U.O({ t: 1, f: 1, g: 100 })
        const filter = U.Q({ t: 2/* 'highpass' */, f: [fADSR, lfo2], q: 0, r$: [osc1, osc1b, osc2] })
        const padADSR = U.A({ a: 1, d: 0, s: 1, r: 1 }, voice)
        const amp = U.G({ g: padADSR, r$: filter })
        const reverb = U.K({ b: U.sr(0.1, 1, 0.95), r$: amp, g: 2 })
        reverb.$(voice)
        // amp.$(voice)
        return voice
      },
      freq: 220,
      off: 0.5,
      rec: 3
    },
    paddy4: {
      fn: U => {
        const voice = U.V({ g: 3 })
        const lfo1 = U.G({ g: voice.f, r$: U.O({ t: 1 /* 'sine' */, f: 2, g: 1 / 440 }) })
        const osc1 = U.O({ t: 4/* 'triangle' */, f: [voice.f, lfo1], g: 1, S: 15 / 12 })
        const osc1b = U.O({ t: 4/* 'triangle' */, f: [voice.f, lfo1], g: 1, d: 14, S: 19 / 12 })
        const osc2 = U.O({ t: 4/* 'triangle' */, f: [voice.f, lfo1], g: 1, d: -12, S: 19 / 12 })
        const fADSR = U.A({ b: 500, a: 1, e: 1200, d: 4, s: 100, r: 2 }, voice)
        const lfo2 = U.O({ t: 1, f: 1, g: 100 })
        const filter = U.Q({ t: 2/* 'highpass' */, f: [fADSR, lfo2], q: 0, r$: [osc1, osc1b, osc2] })
        const padADSR = U.A({ a: 1, d: 0, s: 1, r: 1 }, voice)
        const amp = U.G({ g: padADSR, r$: filter })
        const reverb = U.K({ b: U.sr(0.1, 1, 0.95), r$: amp, g: 2 })
        reverb.$(voice)
        // amp.$(voice)
        return voice
      },
      freq: 220,
      off: 0.5,
      rec: 3
    },
    // paddyCombo: {
    //   fn: U => {
    //     const voice = U.V({ g: 1 })
    //     const lfo1 = U.G({ g: voice.f, r$: U.O({ t: 1 /* 'sine' */, f: 2, g: 1 / 440 }) })
    //     const osc1 = U.O({ t: 3/* 'sawtooth' */, f: [voice.f, lfo1], g: 1, S: 15 / 12 })
    //     const osc1b = U.O({ t: 1/* 'sine' */, f: [voice.f, lfo1], g: 1, d: 14, S: 19 / 12 })
    //     const osc2 = U.O({ t: 4/* 'triangle' */, f: [voice.f, lfo1], g: 1, d: -12, S: 19 / 12 })
    //     const fADSR = U.A({ b: 1800, a: 1, e: 6000, d: 3, s: 100, r: 3 }, voice)
    //     const lfo2 = U.O({ t: 1, f: 1, g: 100 })
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: [fADSR, lfo2], q: 1, r$: [osc1, osc1b, osc2] })
    //     const padADSR = U.A({ a: 1.5, d: 0, s: 1.5, r: 1.3 }, voice)
    //     const amp = U.G({ g: padADSR, r$: filter })
    //     const reverb = U.K({ b: U.sr(0.1, 1, 0.95), r$: amp, g: 2 })
    //     reverb.$(voice)
    //     // amp.$(voice)
    //     return voice
    //   },
    //   freq: 220,
    //   off: 0.5,
    //   rec: 3
    // },
    // bassFilth: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 0.2, b: 146, e: 110, s: 110, r: 1 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2, s: 0.3, a: 0.03, d: 0.1, r: 0.01, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 1, d: 0.1, r: 0.1, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 2400, q: 2, g: 1, r$: [osc1, noise] })
    //     const distort = U.D({ a: 50, r$: filter, g: 1 }) // a = distort amount
    //     const compress = U.R({ k: 1, r$: distort })
    //
    //     filter.$(voice)
    //     distort.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1,
    //   rec: 2
    // },
    // bassFilthTite: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 0.2, b: 146, e: 110, s: 110, r: 1 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2, s: 0.4, a: 0.01, d: 0.3, r: 0.05, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.4, b: 0, e: 0.01, s: 0.1, a: 0.8, d: 0.1, r: 0.1, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: 2400, q: 2, g: 1, r$: [osc1, noise] })
    //     const distort = U.D({ a: 50, r$: filter, g: 1 }) // a = distort amount
    //     const compress = U.R({ k: 1, r$: distort })
    //
    //     filter.$(voice)
    //     distort.$(voice)
    //     compress.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1,
    //   rec: 2
    // },
    bassFilthTite2: {
      fn: U => {
        const voice = U.V()
        const slide1 = U.A({ a: 0.2, b: 146, e: 110, s: 110, r: 1 }, voice)
        var adsr = U.A({ D: 0, b: 0, e: 2, s: 1, a: 0.01, d: 0.3, r: 0.05, p: 0 }, voice)
        const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
        const noiseADSR = adsr = U.A({ D: 0.6, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.1, p: 0 }, voice)
        const noise = U.N({ g: noiseADSR })
        const filter = U.Q({ t: 1/* 'lowpass' */, f: 2800, q: 2, g: 1, r$: [osc1, noise] })
        const distort = U.D({ a: 30, r$: filter, g: 1 }) // a = distort amount
        const compress = U.R({ k: 8, r$: distort })
  
        filter.$(voice)
        distort.$(voice)
        compress.$(voice)
        return voice
      },
      freq: 175,
      off: 1,
      rec: 2
    },
    // strangeBass: {
    //   fn: U => {
    //     const voice = U.V()
    //     const slide1 = U.A({ a: 1, b: 146, e: 110, s: 110, r: 1 }, voice)
    //     var adsr = U.A({ D: 0, b: 0, e: 2.3, s: 1.8, a: 0.01, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1 / 2, g: adsr })
    //     const noiseADSR = adsr = U.A({ D: 0.28, b: 0, e: 0.01, s: 0.1, a: 0.9, d: 0.1, r: 0.2, p: 0 }, voice)
    //     const noise = U.N({ g: noiseADSR })
    //     const distort = U.D({ a: 6, r$: [osc1, noise], g: 4 })
    //     const filterADSR = adsr = U.A({ D: 0.01, b: 2000, e: 100, s: 16000, a: 0.3, d: 0.1, r: 0.3, p: 0 }, voice)
    //
    //     const filter = U.Q({ t: 1/* 'lowpass' */, f: filterADSR, q: 2, g: 1, r$: distort })
    //     filter.$(voice)
    //     return voice
    //   },
    //   freq: 175,
    //   off: 1,
    //   rec: 2
    // },
    click: {
      fn: U => {
        const voice = U.V()
        const adsr = U.A({ a: 0.0001, d: 0.02, s: 0 }, voice)
        const noise = U.N({ g: adsr })
        const filter = U.Q({ t: 3/* 'bandpass' */, q: 0.8, f: 2000, r$: noise, g: 2 }) // Bring down f to your liking
        filter.$(voice)
        return voice
      },
      freq: 100,
      off: 0.1,
      rec: 0.1
    },
    // groundLoop50hz: {
    //   fn: U => {
    //     const voice = U.V()
    //     const adsr = U.A({}, voice)
    //     const osc1 = U.O({ t: 1/* 'sine' */, f: 50 })
    //     const distorter = U.D({ a: 50, r$: osc1 })
    //     const filter = U.Q({ t: 2/* 'highpass' */, q: 0.5, f: 5000, r$: distorter }) // Bring down f to your liking
    //     const compressor = U.R({ k: 0.5, g: 5, r$: filter })
    //     compressor.$(voice)
    //     return voice
    //   },
    //   freq: 50,
    //   off: 3,
    //   rec: 3
    // },
    groundLoop50hz_2: {
      fn: U => {
        const voice = U.V()
        const adsr = U.A({}, voice)
        const osc1 = U.O({ t: 1/* 'sine' */, f: 50 })
        const distorter = U.D({ a: 30, r$: osc1 })
        const filter = U.Q({ t: 2/* 'highpass' */, q: 0.5, f: 3000, r$: distorter }) // Bring down f to your liking
        const compressor = U.R({ k: 0.5, g: 5, r$: filter })
        const reverb = U.K({ b: U.sr(0.1, 1, 0.95), r$: compressor, g: 2 })
        reverb.$(voice)
        // compressor.$(voice)
        return voice
      },
      freq: 50,
      off: 5,
      rec: 6
    },
    // interference: {
    //   fn: U => {
    //     const voice = U.V()
    //     const noise = U.N()
    //     const noiseGate = U.N({ r: 0.001 })
    //     const gateDistort = U.D({ a: 500, r$: noiseGate, g: 5 })
    //     const noiseGain = U.G({ g: 0.5, r$: gateDistort })
    //     const filter = U.Q({ t: 3/* 'bandpass' */, q: 30, f: 2200, r$: noise, g: [U.C(0.5), noiseGain] })
    //     const distorter = U.D({ a: 50, r$: filter })
    //     const otherGate = U.O({ t: 2/* 'square' */, f: 31, g: 0.5 })
    //     const otherGate2 = U.O({ t: 2/* 'square' */, f: 13, g: 0.5 })
    //     const gateGain1 = U.G({ g: [U.C(0.5), otherGate], r$: distorter })
    //     const gateGain2 = U.G({ g: [U.C(0.7), otherGate2], r$: gateGain1 })
    //     const filterAgain = U.Q({ t: 3/* 'bandpass' */, q: 30, f: 4400, r$: gateGain2, g: 2 })
    //     const distorterAgain = U.D({ a: 1.2, g: 30, r$: filterAgain })
    //     distorterAgain.$(voice)
    //     return voice
    //   },
    //   freq: 100,
    //   off: 3,
    //   rec: 3
    // },
    kitten: {
      fn: U => {
        const voice = U.V({ g: 1 })
        const osc1 = U.O({ t: 3/* 'sawtooth' */, f: voice.f, g: 1, S: 1 / 2 })
        const lfo1 = U.G({ g: voice.f, r$: U.O({ t: 1 /* 'sine' */, f: 4, g: 1 }) })
        const fADSR = U.A({ b: 2, a: 5, e: 16000, d: 3, s: 10, r: 1 }, voice)
        const filter = U.Q({ t: 0/* 'highpass' */, f: [fADSR], q: 5, r$: [osc1] })
        const padADSR = U.A({ a: 1, d: 0, s: 1, r: 1 }, voice)
        const amp = U.G({ g: padADSR, r$: filter })
        amp.$(voice)
        return voice
      },
      freq: 220,
      off: 0.7,
      rec: 3
    },
    peyow: {
      fn: U => {
        const voice = U.V()
        const slide1 = U.A({ a: 0.2, b: 5000, e: 220, s: 1, r: 0.1 }, voice)
        var adsr = U.A({ D: 0, b: 0, e: 1, s: 1.8, a: 1, d: 1, r: 0.1, p: 0.1 }, voice)
        const osc1 = U.O({ t: 1/* 'sine' */, f: slide1, S: 1, g: adsr })
        const compress = U.R({ g: 1, k: 4, r$: osc1 })
        compress.$(voice)
        return voice
      },
      freq: 175,
      off: 0.5,
      rec: 1
    }
  }
  
  /*
  
        var voice = U.V(),
          noise = U.N({g: 1}),
  fADSR = U.A({b: 300, a: 4, e: 4000, d: 3, s: 2000, r: 3}, noise),
          lfo = U.O({t: 'sine', f: 15, g: 1500}),
          filter = U.Q({t: 'lowpass', f: [lfo], q: 2, r$: [noise]}),
  
        filter.$(voice);
        return voice;
  */
  // ToneManifest defines which tones are up for tone replacement. They're defined like this:
  //   samp: MOD file sample number (1-32)
  //   def: Name of ToneDef sample
  //   samples: Overrides the number of samples (in bytes)
  //   repeat: Overrides the repeat start point (in bytes)
  //   replen: Overrides the repeat length (in bytes)
  const ToneManifest = [
    {
      samp: 0x6,
      def: ToneDefs.paddy3,
      samples: 0xfffe
    },
    {
      samp: 0x7,
      def: ToneDefs.paddy4,
      samples: 0xfffe
    },
    {
      samp: 0x8,
      def: ToneDefs.bassFilthTite2 // bassFilth'
    },
    {
      samp: 0x9,
      def: ToneDefs.h_optical // 'strangeBass'
    },
    {
      samp: 0xc,
      def: ToneDefs.i_optical // 'strangeBass'
    },
    {
      samp: 0xa,
      def: ToneDefs.rubberband
    },
    {
      samp: 0xb,
      def: ToneDefs.cowbell
    },
    {
      samp: 0xe,
      def: ToneDefs.peyow
    },
    {
      samp: 0xf,
      def: ToneDefs.groundLoop50hz_2
      // -- OVERRIDES --
      // ,samples: 0xEC92,
      // repeat: 0x1CE6,
      // replen: 0xB688
      // ---------------
    },
    {
      samp: 0x10,
      def: ToneDefs.click
    },
    {
      samp: 0xd,
      def: ToneDefs.kitten
    },
    {
      samp: 0x16,
      def: ToneDefs.reese10
    }
  ]
  
  // ToneOffsets will hold {samples:, offsets:} entries for each MOD file sample.
  const ToneOffsets = []
  
  const ToneUtils = (() => ({
    // initManifest() reads out the MOD file sample buffer offsets and writes them into ToneManifest.
    initManifest (modBuffer) {
      var i
      var gap
      var accum = 0
      var item
      var o
  
      // Step 1: Get offsets:
      for (i = 0; i < 32; i++) {
        gap = (modBuffer[42 + 30 * i] * 256 + modBuffer[43 + 30 * i]) * 2 // modBuffer.readUInt16BE(42 + 30 * i) * 2;
        ToneOffsets.push({
          samples: gap,
          offset: accum
        })
        accum += gap
      }
  
      // Step 2: Write into ToneManifest:
      for (i in ToneManifest) {
        item = ToneManifest[i]
        o = ToneOffsets[item.samp - 1]
        item.samples = o.samples
        item.offset = o.offset
      }
  
      // Step 3: Sort ToneManifest:
      ToneManifest.sort((a, b) => a.samp - b.samp)
    },
  
    // writeOverrides() alters the MOD file structure to accommodate custom sample length and
    // looping settings.
    writeOverrides (modBuffer) {
      var i, item, o, gap
  
      for (i in ToneManifest) {
        item = ToneManifest[i]
        o = item.samp - 1
        if (item.samples) {
          gap = ~~(item.samples / 2)
          modBuffer[42 + 30 * o] = ~~(gap / 256)
          modBuffer[43 + 30 * o] = gap % 256
        }
        if (item.repeat) {
          gap = ~~(item.repeat / 2)
          modBuffer[46 + 30 * o] = ~~(gap / 256)
          modBuffer[47 + 30 * o] = gap % 256
        }
        if (item.replen) {
          gap = ~~(item.replen / 2)
          modBuffer[48 + 30 * o] = ~~(gap / 256)
          modBuffer[49 + 30 * o] = gap % 256
        }
      }
    },
  
    // expand adds in zeroed spaces according to the Manifest and returns a new array.
    // Must call initManifest first.
    expand (sampleData) {
      var j = 0
      var ret = []
      var priorOffset = 0
      var adj = 0
      while (j < ToneManifest.length) {
        ret = [...ret, ...sampleData.slice(priorOffset, ToneManifest[j].offset - adj),
          ...(new Array(ToneManifest[j].samples).fill(0))]
        adj += ToneManifest[j].samples
        priorOffset = ToneManifest[j].offset - adj + ToneManifest[j].samples
        j++
      }
      ret = [...ret, ...sampleData.slice(priorOffset)]
      return ret
    },
  
    // inject records a sample and writes it into the sample buffer.
    // Must call expand first.
    // Calls callback when completed.
    inject (sampleData, callback) {
      const T = this
      var i
      for (i in ToneManifest) {
        const item = ToneManifest[i]
        const pFunc = callback
        const sampleRate = item.sr || R
        callback = () => {
          T.record(item.def, item.samples / sampleRate, sampleRate,
            renderedBuffer => {
              const buf = renderedBuffer.getChannelData(0)
              var i
              for (i = 0; i < item.samples; i++) {
                sampleData[item.offset + i] = buf[i]
              }
              return pFunc()
            }
          )
        }
      }
      callback()
    },
  
    // record records a sample according to the ToneDef definition, which
    // must include: fn(USynth) that returns voice, freq (default 440),
    // off (default disabled), and chan (default 1). Pass in duration and
    // sample rate plus a callback that takes a rendered buffer as a parameter.
    record (toneDef, dur, sampleRate, callback) {
      var oac, synth, voice, now
      oac = new OfflineAudioContext(toneDef.chan || 1, sampleRate * dur, sampleRate)
      synth = USynth(oac)
  
      voice = toneDef.fn(synth)
      now = synth.now()
      if (voice) {
        voice.off(now)
        voice.on(now, toneDef.freq || 440)
        toneDef.off && voice.off(now + toneDef.off)
      }
  
      oac.startRendering().then(renderedBuffer => {
        voice && voice.del()
        callback(renderedBuffer)
      })
    }
  
    /*
      // Registrants that register themselves via reg(). Each entry should have:
      // Everything defined in "ToneDef" above, plus optional loopCF, loopStart, and store.
      _reg: [],
  
      // Causes scheduling and recording of sound effects at prescribed time.
      reg(registrant) {
          this._reg.push(registrant);
      },
  
      // Kicks off the recording of all samples; calls callback when finished.
      doRec(uSynth, toneDef, callback)  {
          var T = this,
              newCB;
          T._reg.forEach(registrant => {
              newCB = () => {
                  var metaCB = buffer => {
                      registrant.store(buffer);
                      callback && callback();
                  }
                  T.recSFX(toneDef, uSynth, metaCB, registrant.loopCF, registrant.loopStart);
              };
              callback = newCB;
          });
          callback();
      },
  */
    // recSFX is called for each SFX that registered itself, and returns a playable buffer
    // via a callback. Set loopCF to number of seconds to cross-fade and loop.
    //
    //   recSFX (toneDef, uSynth, callback, loopCF, loopStart = 0) {
    //     const bufferator = buf => {
    //       const finalBuf = uSynth.B({ T: toneDef.rec, s: -1 })
    //       var chan
    //
    //       // This optionally coordinates the loop crossfade:
    //       finalBuf.b = buf
    //       if (!isNaN(loopCF)) {
    //         for (chan = 0; chan < (toneDef.chan || 1 /* buf.numberOfChannels */); chan++) {
    //           const data = finalBuf.x(chan)
    //           const gap = ~~(loopCF * finalBuf.F)
    //           const begin = ~~(loopStart * finalBuf.F)
    //           const end = finalBuf.N - gap
    //           var i
    //           for (i = 0; i < gap; i++) {
    //             data[end + i] = data[end + i] * (1 - (i / gap) ** 2) + data[begin + i] * (i / gap) ** 2
    //           }
    //         }
    //         // Then we package up the buffer to be playable using the USynth context:
    //         finalBuf.B.loopStart = loopStart + loopCF
    //         finalBuf.B.loopEnd = toneDef.rec
    //         finalBuf.L(true)
    //       } else {
    //         // Package up with no looping:
    //         finalBuf.L(false)
    //       }
    //       callback(finalBuf)
    //     }
    //     ToneUtils.record(toneDef, toneDef.rec, uSynth.SR, bufferator)
    //   },
    //
    //   // player is a generic player that sets up a voice that plays a sample.
    //   player (buffer, uSynth, vol, nowFlag = true, kill = 0, fadeIn = 0.001, fadeOut = 0) {
    //     const voice = uSynth.V()
    //     const adsr = uSynth.A({ a: fadeIn, e: vol, d: 0, s: vol, r: fadeOut }, voice)
    //     buffer.$(voice)
    //     adsr.$(voice.g)
    //     const now = uSynth.now()
    //     if (nowFlag) {
    //       buffer.s.go(now)
    //       voice.on(now)
    //     }
    //     if (kill) {
    //       buffer.s.no(now + kill)
    //     }
    //     voice.b = buffer
    //     voice.a = adsr
    //     return voice
    //   }
  /*
      // autoDel coordinates the deletion of a voice:
      autoDel(voice, delay = 1000) {
          voice.off();
          setTimeout(delay, voice.del);
      }
  */
  }))()
  
  if (typeof module !== 'undefined') {
    module.exports = {
      ToneDefs, ToneManifest, ToneUtils, ToneOffsets
    }
  }
  