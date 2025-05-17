import express from 'express'
import { PORT } from './config.js'

const app = express()


app.get('/', (req, res) => {
    res.send('Hola mundo')
})

app.post('/login', (req,res) => {
    res.json({ user : 'therichleo' })
})
app.post('/register', (req,res) => {})
app.post('/logout', (req,res) => {})
app.get('/protected', (reeq,res) => {})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})





app.use((req,  res) => {
    res.status(404).send('<h1>404</>')
})

