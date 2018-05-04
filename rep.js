const hyperdrive = require('hyperdrive')
const discovery = require('webrtc-swarm')
const pump = require('pump')
const rai = require('random-access-idb')
const signalhub = require('signalhubws')

const key = '99793dd71273b0cf70060bbfffda059dcd544d034d5947c05e451b073b540e93'
const hub = signalhub(key, ['wss://soyuka.pw'])
const swarm = discovery(hub)

swarm.on('connect', function (peer) {
  console.log('got connection', peer)
  if (!peer.channelName) {
    return
  }

  const storage = rai(`doc-${key}`)
  const archive = hyperdrive(storage, key)

  archive.ready(function () {
    const stream = archive.replicate({encrypt: false, live: true})

    pump(peer, stream, peer, function (err) {
      console.log('rep end')
    })
  })
})
