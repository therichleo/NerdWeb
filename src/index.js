const express = require('express')
const app = express()

app.use((req,  res) => {
    res.status(404).send('<h1>404</>')
})

app.get('/', (req, res) => {
    res.send('Hola mundo')
})

server.listen(0, () => {
    console.log(`Server listening on port http://localhost:${server.address().port}`)
})