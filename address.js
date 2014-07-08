define(
  [ 'nap'
  , 'd3'
  , './web!'
  , 'type/type'
  , './http-status-code'
  ]
  , function(nap, d3, web, type, codes) {

    var viewTypes = {
        "application/x.nap.view" : true
      , "application/x.am.app" : true
      , "application/x.am.legacy-app" : true
      }

    function address(r) {

      var uri
        , name
        , method = "get"
        , headers = { accept : "application/x.nap.view" }
        , params = {}
        , query = {}
        , body
        , node
        , callback
        , target
        , dispatcher = d3.dispatch.apply(null, codes.range().concat(['err', 'done']))

      if(r && type.isString(r)) {
        uri = r
      } else if(r && type.isObject(r)) {
        uri = r.uri || uri
        method = r.method || method
        headers = r.headers || headers
        body = r.body || body
      }

      function req() {
        return {
          uri : interpolate(uri, params) + serialize(query)
        , method : method
        , headers : headers
        , body : body
        , context : node
        }
      }

      function interpolate(uri, params) {
        if(!Object.keys(params).length) return uri
        return web.uri(uri, params)
      }

      function serialize(query) {
        var params = Object.keys(query).reduce(function(a,k) {
          a.push(k + '=' + query[k])
          return a
        },[])
        return params.length ? '?' + params.join('&') : ''
      }

      function into(node, err, res) {
        if(res.statusCode != 200) return
        if(!res.headers.contentType) return
        if(!viewTypes[res.headers.contentType]) return
        if(!type.isFunction(res.body)) return
        if(!node) return

        node.dispatchEvent && node.dispatchEvent(new CustomEvent("update"))
        res.body(node)
      }

      function api() {
        web.req(req(), function(err, res) {
          node && into(node, err, res)
          callback && callback(err, res)

          if(err) return dispatcher.err(err), null

          codes(res.statusCode).forEach(function(type) { dispatcher[type](res) })
          dispatcher.done(res)
        })
      }

      api.uri = function(u) {
        if(!arguments.length) return uri
        uri = u
        return api
      }

      api.method = function(m) {
        if(!arguments.length) return method
        method = m
        return api
      }

      api.header = function(k, v) {
        if(!arguments.length) return headers
        if(type.isString(k)) {
          headers[k] = v
          return api
        }
        if(type.isObject(k)) {
          Object.keys(k).forEach(function(key) {
            headers[key] = k[key]
          })
          return api
        }

        return api
      }

      api.param = function(k, v) {
        if(!arguments.length) return params
        if(type.isString(k)) {
          params[k] = v
          return api
        }
        if(type.isObject(k)) {
          Object.keys(k).forEach(function(key) {
            params[key] = k[key]
          })
          return api
        }

        return api
      }

      api.query = function(k, v) {
        if(!arguments.length) return query
        if(type.isString(k)) {
          query[k] = v
          return api
        }
        if(type.isObject(k)) {
          Object.keys(k).forEach(function(key) {
            query[key] = k[key]
          })
          return api
        }

        return api
      }

      api.body = function(b) {
        if(!arguments.length) return body
        body = b
        return api
      }

      api.then = function(cb) {
        console.log("deprecated : address.then(). please use event api instead.")
        if(!arguments.length) return callback
        callback = cb
        return api
      }

      api.into = function(n) {
        if(!arguments.length) return node
        if(type.isString(n)) n = d3.select(n).node()

        node = n
        return api
      }

      api.target = function(t) {
        if(!arguments.length) return target
        target = t
        return api
      }

      api.navigate = function() {

        var hash = "#" + req().uri

        if(!target) {
          document.location.hash = hash
          return
        }
        
        var href = document.location.href
        href = /#/.test(href) ? href.replace(/#.*/, hash) : href + hash
        window.open(href, target, '')
      }

      api.json = function() {
        return api.header('accept','application/json')
      }

      api.xml = function() {
        return api.header('accept','text/xml')
      }

      api.text = function() {
        return api.header('accept','text/plain')
      }

      api.get = function() {
        return api.method('get')
      }

      api.post = function(body) {
        return api.method('post').body(body)
      }

      api.put = function(body) {
        return api.method('put').body(body)
      }

      api.patch = function(body) {
        return api.method('patch').body(body)
      }

      api.remove = function() {
        return api.method('remove')
      }

      return d3.rebind(api, dispatcher, 'on')
    }

    address.find = function(uri) {
      return web.find(uri)
    }

    return address
  }
)