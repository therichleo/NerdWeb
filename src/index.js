import express, { json } from 'express'
import jwt from 'jsonwebtoken'
import { PORT, LLAVE_SECRETA } from './config.js'
import { UserRepository } from './user-repository.js'
import { engine } from 'express-handlebars'

const app = express()
app.use(express.json()) //express.json ayuda a mirar req.body 

// Configure handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home', {username: 'therichleo'} )
})

app.post('/login', async (req,res) => {
    const { email, password } = req.body

    try{
        const user = await UserRepository.login({ email, password })
        const token = jwt.sign({ id: user.id }, LLAVE_SECRETA, {
            expiresIn: '1h'
        })
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
app.get('/profile', (req,res) => {

})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})





app.use((req,  res) => {
    res.status(404).send('<h1>404</>')
})

