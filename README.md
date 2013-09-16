mirror-api-subscription
=======================

Manages subscription callback from Google Mirror API.

```js
var express = require('express')
  , app = express()

app.use(express.bodyParser())
app.use(app.router)

var User = require('./models/user')


var subscription = require('mirror-api-subscription')(
function (userToken, verifyToken, done) {
  User.findOne({
    userToken: userToken
  , verifyToken: verifyToken
  }, done)
})

subscription.on('locations#UPDATE',
function (notification, user, payload) {
  console.log('location of user %s updated', user.id)
})

subscription.on('timeline#INSERT:SHARE',
function (notification, user, payload) {
  console.log('user %s just shared to your Glassware with timeline item %s'
  , user.id, notification.itemId)
})

app.post('/notification', subscription.dispatcher())
```

## TODO

- Test cases
- API Documentation
