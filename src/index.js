import express from 'express'
import { PORT } from './config.js'
import { UserRepository } from './user-repository.js'

const app = express()
app.use(express.json()) //express.json ayuda a mirar req.body 


app.get('/', (req, res) => {
    res.send('Hola mundo')
})

app.post('/login', async (req,res) => {
    const { email, password } = req.body

    try{
        const user = await UserRepository.login({ email, password })
        res.send({ user })
    } catch(error){
        res.status(401).send(error.message)
    }
})


app.post('/register', async (req,res) => {
    const { username, password, email, anonimato } = req.body
    console.log(req.body)

    try{ 
        const id = await UserRepository.create({ username, password, email, anonimato })
        res.send({id})
    } catch(error){
        //Lo mejor no es mandar el error entero, si no aclarar mejor (proximamente)
        res.status(400).send(error.message)
    }
})

app.post('/logout', (req,res) => {})
app.get('/protected', (req,res) => {})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})





app.use((req,  res) => {
    res.status(404).send('<h1>404</>')
})

