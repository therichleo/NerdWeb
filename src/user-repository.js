import dbLocal from 'db-local'; // Base de datos LOCAL, implementable y facil de montar otra diferente
import { Magic_number } from './config.js';
const { Schema } = new dbLocal({ path: './db' });

import bcrypt from 'bcrypt';

const User = Schema('User', {
  id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  anonimato: { type: Boolean, required: true },
});

export class UserRepository {
  static async create({ username, password, email, anonimato }) {
    Validation.email(email);
    Validation.username(username);
    Validation.password(password);
    Validation.anonimato(anonimato);

    //hashSync para entornos pequeños y testeos se podira decir y utilizar el hash (async y awaits) para entornos de servidores y multiples conexiones
    const hashedPassword = await bcrypt.hash(password, Magic_number);
    const id = crypto.randomUUID();

    User.create({
      id,
      username,
      password: hashedPassword,
      email,
      anonimato,
    }).save();
    return id;
  }

  static async login({ email, password }) {
    Validation.email(email);
    Validation.password(password);

    const user = User.findOne({ email });
    if (!user) throw new Error('There is no user with that email');

    const isValid = await bcrypt.compare(password, user.password); //password es el que nos pasan y el user.password es el hasheado en bdd
    if (!isValid) throw new Error('Password is invalid');

    //const { password: _, ...publicUser } = user   -> esto permite eliminar dato password y cederle todos los demas datos de ser a public user
    //                                              -> esta forma no es la mas adecuada (insegura)

    const PublicUser = {
      //esta forma es mucho mejor para verificar que campos devolver
      email: user.email,
    };
    return PublicUser;
  }

  static async getById(id) {
    const user = User.findOne(id);
    if (!user) {
      throw new Error('user not found');
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      anonitamo: user.anonimato,
    };
  }
}

class Validation {
  static email(email) {
    //1. Verificar email
    //if(typeof email != 'string') throw new Error('Password must be a string')
    //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //if (!emailRegex.test(email)) throw new Error('Email format is invalid');
    //const emailExists = User.findOne({ email });
    //if (emailExists) throw new Error('Email already registered');
  }

  static username(username) {
    const user = User.findOne({ username });
    if (user) throw new Error('Username already exists, change your username');
    if (typeof username != 'string')
      throw new Error('username must be a string');
    if (username.length < 3)
      throw new Error('Username must be at least 3 characters lenght');
  }

  static password(password) {
    if (typeof password != 'string')
      throw new Error('Password must be a string');
    //if(password.length < 6) throw new Error('Password must be at least 6 characters lenght')
    //if(!password.includes("$") || !password.includes("#") || !password.includes("&")) throw new Error('Password must have a character like "#,$,&"')
  }
  static anonimato(anonimato) {
    if (typeof anonimato != 'boolean')
      throw new Error('anonimato must be a boolean (true or false)');
  }
}
