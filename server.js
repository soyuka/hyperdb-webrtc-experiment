const hyperdrive = require('hyperdrive')
const discovery = require('webrtc-swarm')
const signalhub = require('signalhubws')
const pump = require('pump')

const archive = hyperdrive('./dat-list.db')
const list = ['key1']

archive.ready(function () {
  console.log('Key:', archive.key.toString('hex'))
  console.log('Discover: ', archive.discoveryKey.toString('hex'))

  // archive.writeFile('list.json', JSON.stringify(list), function (err) {
  //   console.log('written')
  // })
  const link = archive.discoveryKey.toString('hex')
  const hub = signalhub(link, ['wss://soyuka.pw'], require('ws'))
  const swarm = discovery(hub, {
    wrtc: require('wrtc')
  })

  swarm.on('peer', function (peer, id) {
    console.log('got co')
    pump(peer, archive.replicate({encrypt: false, live: true}), peer, function (err) {
      console.log('rep ends')
    })
  })
})
