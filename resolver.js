define(
  [ 'logger/log!platform/am-address'
  , 'underscore'
  ]
  , function(log, _) {

    return function (dep) {

      return function(req, res) {

        if (require.defined(dep)) callHandler(require(dep))
        else require([dep], callHandler)

        function callHandler (fn) {
          fn = fn[req.method] || fn

          if(!_.isFunction(fn)) {
            log.debug("failed to resolve resource function from module", dep, req.method)
            return
          }

          fn.call(null, req, function() {
            if(arguments.length == 1) return res.call(null, null, arguments[0])
            res.apply(null, arguments)
          })
        }
      }

    }
  }
)

