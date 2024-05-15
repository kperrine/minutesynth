# MinuteSynth

*"How it's pronounced is up to you!"*

Copyright (C) Kenneth A. Perrine, 2024<br>
Please see LICENSE file for MIT License<br>
http://www.academiken.com

This is a small-scale front-end for working with the WebAudio library found in modern web browsers. The motivation for creating this was to leverage the powerful features of WebAudio in a form that was more compact than WebAudio itself could offer. It was used by Neurolyte in a couple of 64K JavaScript demo projects. The pluggable design was helpful for tinkering with sounds at the barest minimum of overhead. The library's terseness helped in whipping up code quickly and estimating final code size. After minifying, it was remarkably small.

This differs from some other incredibly small synthesizers in that MinuteSynth heavily uses WebAudio directly, whereas others like ZZFX calculate a buffered sound sample from a preselected set of functions for playing back. There may be advantages and disadvantages for each approach; it depends on the final targeted purpose.

The .js can be included in a project and immediately used. The "recorder.html" file allows for immediate synth editing and raw audio file recording. A number of demos are provided.

Please see documentation in the [docs](docs) directory for more information and a reference card.

