# MinuteSynth

*"How it's pronounced is up to you!"*

Version 0.95c

Copyright (C) Kenneth A. Perrine, 2024<br>
Please see LICENSE file for MIT License<br>
http://www.academiken.com

This is a small-scale front-end for working with the WebAudio library found in modern web browsers. The motivation for creating this was to leverage the powerful features of WebAudio in a form that was more compact than WebAudio itself could offer, and to add extra bits of functionality. It was used by Neurolyte in a couple of 64K JavaScript demo projects. The pluggable design was helpful for tinkering with sounds in the repo's lab.html at the barest minimum of overhead. The library's terseness helped in whipping up code quickly and estimating final code size. After minifying, it was remarkably small.

This differs from some other incredibly small synthesizers in that MinuteSynth is a wrapper for WebAudio with some extra features, whereas others like ZZFX calculate a buffered sound sample from a preselected set of functions for playing back. There may be advantages and disadvantages for each approach; it depends on the final targeted purpose.

The .js can be included in a project and immediately used. The "lab.html" file allows for immediate synth editing and raw audio file recording. A number of demos are provided.

Please see documentation in the [docs](docs) directory for more information.

Load "lab.html" locally into your web browser, or access online at [http://www.academiken.com/minutesynth/lab.html](http://www.academiken.com/minutesynth/lab.html) to see demos!

---

Special thanks to Neurolyte for this project's original purpose and motivation: @ig0r, @7r1x, @kipz, @marc
