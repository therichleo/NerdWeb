import dbLocal from "db-local"; // Base de datos LOCAL, implementable y facil de montar otra diferente
const { Schema } = new dbLocal({ path: './db'})

const User = Schema('User', {
    id: { type: String, required: true },
    username: { type: String, required: true },
    password: {type: String, required: true},
    name : { type : String, required: true },
    anonimato : { type: Boolean, required: true },
})

export class UserRepository {
    static create ({ username, password, email, anonimato }) {
        //1. validaciones (password with simbols and signals... coming soon)
        if(typeof username != 'string') throw new Error('username must be a string')
        if(username.length < 3) throw new Error('Username must be at least 3 characters lenght')
        if(typeof password != 'string') throw new Error('Password must be a string')
        if(password.length < 6) throw new Error('Password must be at least 6 characters lenght')
        if(!password.includes("$") || !password.includes("#") || !password.includes("&")) throw new Error('Password must have a character like "#,$,&"')



        //2. Asegurarse que el username no existe
    }
    static login ({ username, password }) {}
}