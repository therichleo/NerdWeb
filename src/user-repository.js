import dbLocal from "db-local"; // Base de datos LOCAL, implementable y facil de montar otra diferente
const { Schema } = new dbLocal({ path: './db'})

const User = Schema('User', {
    id: { type: String, required: true },
    username: { type: String, required: true },
    password: {type: String, required: true},
    email: {type: String, required: true},
    anonimato : { type: Boolean, required: true },
})

export class UserRepository {
    static create ({ username, password, email, anonimato }) {
        //1. Verificar email
        //if(typeof email != 'string') throw new Error('Password must be a string')
        //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        //if (!emailRegex.test(email)) throw new Error('Email format is invalid');
        //const emailExists = User.findOne({ email });
        //if (emailExists) throw new Error('Email already registered');
        //2. validaciones password 
        if(typeof username != 'string') throw new Error('username must be a string')
        if(username.length < 3) throw new Error('Username must be at least 3 characters lenght')
        if(typeof password != 'string') throw new Error('Password must be a string')
        //if(password.length < 6) throw new Error('Password must be at least 6 characters lenght')
        //if(!password.includes("$") || !password.includes("#") || !password.includes("&")) throw new Error('Password must have a character like "#,$,&"')
        //3. Asegurarse que el username no existe
        const user = User.findOne({ username })
        if(user) throw new Error('Username already exists, change your username')
        //4. Creacion de ID random (Mejor opcion base de datos con ID unico)
        const id = crypto.randomUUID()
        //5. Anonimato Booleano
        if(typeof anonimato != 'boolean') throw new Error('anonimato must be a boolean (true or false)')

        User.create({
            id,
            username,
            password,
            email,
            anonimato
        }).save()
        return id
    }
    static login ({ username, password }) {}
}