var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits
  , moment = require('moment')

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

Subscription.prototype.verbose = function (message) {
  var args = Array.prototype.slice.call(arguments, 2)
  args[2] = moment().format('YYYY-MM-DD HH:mm:ss.SSS') + ' '
          + this.itemId + ' '
          + this.user.id + ' '
          + args[2]

  console.log.apply(console, args)
}

Subscription.prototype.error = function (err) {
  console.warn(
    moment().format('YYYY-MM-DD HH:mm:ss.SSS') + ' '
  + this.itemId + ' '
  + this.user.id + ' '
  + 'ERROR'
  )

  console.error(err.stack)
}

Subscription.prototype.verifyer = function (userToken, verifyToken, callback) {
  callback(new Error('You must override Subscription#verifyer()'))
}

Subscription.prototype.dispatcher = function () {
  var self = this
  return function (req, res) {
    res.send(200)

    var notification = req.body

    if (!notification)              return
    if (!notification.collection)   return
    if (!notification.operation)    return
    if (!notification.userToken)    return
    if (!notification.verifyToken)  return

    self.verifyer(notification.userToken, notification.verifyToken,
    function (err, user) {
      if (err) {
        return self.error(err)
      }

      if (!user) {
        return self.error(new Error('Invalid userToken, abandoned'))
      }

      var eventName = notification.collection + '#' + notification.operation

      if (notification.userActions) {
        notification.userActions.forEach(function (action) {
          var actionEventName = eventName + ':' + action.type

          if (action.payload) {
            self.emit(actionEventName, notification, user, action.payload)
          }
          else {
            self.emit(actionEventName, notification, user)
          }
        })
      }
      else {
        self.emit(eventName, notification, user)
      }
    })
  }
}
