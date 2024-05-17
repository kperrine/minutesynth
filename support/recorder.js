"use strict";

function record8(voiceName, voiceFunc, sampleRate=16574, dur=3.95, noteFreq, noteOff, callback) {
  console.log('Beginning rendering.')
  var R = sampleRate
  let oac = new OfflineAudioContext(1, ~~(R * dur), R)
  let synth = M$(oac)

  let voice = voiceFunc(synth)
  let now = synth.now()
  voice.off(now)
  voice.on(now, noteFreq)
  if (!isNaN(noteOff)) {
    voice.off(now + noteOff)
  }

  oac.startRendering().then(renderedBuffer => {
    console.log('Rendering completed successfully.')
    let buf = renderedBuffer.getChannelData(0)
    var samples = new Int8Array(buf.length)
    let val
    let min = 0
    let max = 0
    for (let i = 0; i < buf.length; i++) {
        val = buf[i]
        val = (val > 1) ? 127 : ((val < -1) ? -128 : ~~(val * 127))
        samples[i] = val // Automatic two's complement encoding.
        if (val > max) max = val
        if (val < min) min = val
    }
    console.log(`min ${min} max ${max}`)
    return callback ? callback(samples, voiceName, renderedBuffer, sampleRate, dur) : void 0
  })
}
  
function _makeLink(samples, voiceName, buf, sampleRate, dur) {
  // Provide buffer for playback and play it:
  let playBuf = m$.ac.createBuffer(1, ~~(sampleRate * dur), 27928/*sampleRate*/)
  let srcData = buf.getChannelData(0)
  let data = playBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = srcData[i]
  }
  let playBufNode = m$.ac.createBufferSource()
  playBufNode.buffer = playBuf
  playBufNode.loop = false
  playBufNode.connect(m$.ac.destination)
  playBufNode.connect(analyser) // Connect playback to analyzer. Not with a "z".
  playBufNode.start()

  // Create downloadable raw file contents:
  console.log('Creating link.')
  const blob = new Blob(
    [samples],
    {type: 'octet/stream'}
  )

  // Create a download link for the blob content
  const downloadLink = downloadBlob(blob, voiceName + '.raw')

  // Set the title and classnames of the link
  downloadLink.title = 'Export ' + voiceName + '.raw'
  downloadLink.classList.add('btn-link', 'download-link')

  // Set the text content of the download link
  downloadLink.textContent = 'Export ' + voiceName + '.raw'

  // Attach the link to the DOM
  document.getElementById('exportLink').innerHTML = ''
  document.getElementById('exportLink').appendChild(downloadLink)
}
  
function downloadBlob(blob, filename) {
  // A lot of this lifted from: https://blog.logrocket.com/programmatic-file-downloads-in-the-browser-9a5186298d5c/

  // Create an object URL for the blob object
  const url = URL.createObjectURL(blob)

  // Create a new anchor element
  const a = document.createElement('a')

  // Set the href and download attributes for the anchor element
  // You can optionally set other attributes like `title`, etc
  // Especially, if the anchor element will be attached to the DOM
  a.href = url
  a.download = filename || 'download'

  // Click handler that releases the object URL after the element has been clicked
  // This is required for one-off downloads of the blob content
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.removeEventListener('click', clickHandler)
    }, 150)
  }

  // Add the click event listener on the anchor element
  // Comment out this line if you don't want a one-off download of the blob content
  a.addEventListener('click', clickHandler, false)

  // Programmatically trigger a click on the anchor element
  // Useful if you want the download to happen automatically
  // Without attaching the anchor element to the DOM
  // Comment out this line if you don't want an automatic download of the blob content
  //a.click();

  // Return the anchor element
  // Useful if you want a reference to the element
  // in order to attach it to the DOM or use it in some other way
  return a
}
