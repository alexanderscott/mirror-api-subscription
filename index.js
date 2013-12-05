var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits

var debug = require('debug')('subscription')

function Subscription (verifyer) {
  if (!(this instanceof Subscription)) {
    return new Subscription(verifyer)
  }

  EventEmitter.call(this)

  if ('function' == typeof verifyer) {
    this.verifyer = verifyer
  }
}

inherits(Subscription, EventEmitter)
module.exports = Subscription

Subscription.prototype.verifyer = function (userToken, verifyToken, callback) {
  callback(new Error('You must override Subscription#verifyer()'))
}

Subscription.prototype.dispatcher = function () {
  var self = this
  return function (req, res) {
    res.send(200)

    var notification = req.body

    debug('got notification')

    if (!notification)              return
    if (!notification.collection)   return
    if (!notification.operation)    return
    if (!notification.userToken)    return
    if (!notification.verifyToken)  return

    self.verifyer(notification.userToken, notification.verifyToken,
    function (err, user) {
      if (err) {
        debug('error when verifying user')
        console.error(err.stack || err)
        return
      }

      if (!user) {
        debug('invalid token %s, %s',
          notification.userToken, notification.verifyToken)
        return
      }

      var eventName = notification.collection + '#' + notification.operation

      if (notification.userActions) {
        notification.userActions.forEach(function (action) {
          eventName += ':' + action.type

          if (action.payload) {
            eventName += '(' + action.payload + ')'
          }

          debug('emit %s for user %s', eventName, user.id)
          self.emit(eventName, notification, user)
        })
      }
      else {
        debug('emit %s for user %s', eventName, user.id)
        self.emit(eventName, notification, user)
      }
    })
  }
}
