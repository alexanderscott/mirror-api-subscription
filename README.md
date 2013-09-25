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

subscription.on('timeline#UPDATE:CUSTOM',
function (notification, user, payload) {
  if ('LIKE' == payload) {
    console.log('user %s like %s', user.id, notification.itemId)
  }
})

app.post('/notification', subscription.dispatcher())
```

## API

### Subscription([verifier])

Returns a new subscription instance optionally specifing a verifier
function. It's an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter)
instance so that you can attach event listener to it.

#### Arugments

- ***verifyer(userToken, verifyToken, callback)*** {Function} - Verifier
  function that is used to fetch user profile from your database with `userToken`.
  - **userToken** {String} - User token you specified when registering
    the subscription callback representing an individual user.
  - ***verifyToken*** {String|null} - Verify token you specified when
    registering the subscription callback for verifying the validity of
    this notification.
  - **done(err, user)** {Function} - An callback that must be called to
    return an user object after you finished fetching from your database.

#### Returns

{Subscription} - The instance

### Subscription#on
### Subscription#once
### Subscription#off

### Subscription#dispatcher()

## TODO

- Test cases
- API Documentation
