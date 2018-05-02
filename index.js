const hyperdb = require('hyperdb')
const discovery = require('webrtc-swarm')
const idb = require('random-access-idb')('reddat')
const to2 = require('to2')
const pump = require('pump')
const signalhub = require('signalhubws')

const key = window.location.hash.substring(1)

const db = hyperdb(function (name) {
  return idb(name)
}, key || undefined)

db.on('ready', function () {
  const hub = signalhub(db.key.toString('hex'), ['wss://soyuka.pw'])

  console.log('db ready, key', db.key.toString('hex'))
  console.log('local key', db.local.key.toString('hex'))

  const swarm = discovery(hub)

  // simulate everything open/connected lazy
  setTimeout(() => {
    if (db.local.key === db.key) {
      db.put('/hello', 'world', function (err) {
        if (err) {
          console.error(err)
          return
        }

        console.log('written')
      })
    } else {
      db.get('/hello', function (data) {
        console.log(data)
      })
    }
  }, 3000)

  swarm.on('connect', function (peer) {
    console.log('got connection', peer)
    if (!peer.channelName) {
      return
    }

    try {
      var remotePeerKey = Buffer.from(peer.channelName, 'hex')
    } catch (e) {
      console.error(e)
      return
    }

    db.createHistoryStream()
    // const stream = db.replicate({live: true, userData: db.local.key})
    // pump(stream, peer, stream, function () {
    //   console.log('end rep')
    // })

    db.authorized(remotePeerKey, function (err, auth) {
      if (err) {
        console.error(err)
        return
      }

      if (auth) {
        console.log('peer already authorized')
        return
      }

      db.authorize(remotePeerKey, function (err) {
        if (err) {
          console.error(err)
          return
        }

        console.log('New peer %s authorized!', remotePeerKey.toString('hex'))
      })
    })
  })
})
