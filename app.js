const express = require('express')
const app = express()

var myLogger = function (req, res, next) {
  console.log('LOGGED')
  console.log(req)
  next()
}

app.use(myLogger)


var requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  next()
}

app.use(requestTime)

app.get('/', function (req, res) {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + req.requestTime + '</small>'
  res.send(responseText)
})

app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
app.use('/user/:id', function (req, res, next) {
  console.log('ID:', req.params.id)
  res.send('USER :'+ req.params.id)
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
