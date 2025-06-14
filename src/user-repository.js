import dbLocal from 'db-local'; // Base de datos LOCAL, implementable y facil de montar otra diferente
import { Magic_number } from './config.js';
import fs from 'fs';
import path from 'path';

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

    const usersPath = path.join('./db', 'User.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    const user = User.findOne({ id });

    const PublicUser = {
      email: user.email,
    };
    return PublicUser;
  }

  static async login({ email, password }) {
    const user = User.findOne({ email });
    if (!user) throw new Error('EMAIL_NO_EXIST');

    const isValid = await bcrypt.compare(password, user.password); //password es el que nos pasan y el user.password es el hasheado en bdd
    if (!isValid) throw new Error('PASSWORD_INVALID');

    //const { password: _, ...publicUser } = user   -> esto permite eliminar dato password y cederle todos los demas datos de ser a public user
    //                                              -> esta forma no es la mas adecuada (insegura)

    const PublicUser = {
      //esta forma es mucho mejor para verificar que campos devolver
      id: user.id,
      email: user.email,
    };
    return PublicUser;
  }

  static async getById(id) {
    const user = User.findOne({ id });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      anonimato: user.anonimato,
    };
  }

  static async getByUsername(username) {
    const user = User.findOne({ username });
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    return {
      id: user.id,
    };
  }
}

class Validation {
  static email(email) {
    //1. Verificar email
    //if(typeof email != 'string') throw new Error('Password must be a string')
    //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //if (!emailRegex.test(email)) throw new Error('Email format is invalid');
    const emailExists = User.findOne({ email });
    if (emailExists) throw new Error('EMAIL_ALREADY_EXIST');
  }

  static username(username) {
    const user = User.findOne({ username });
    if (user) throw new Error('USERNAME_ALREADY_EXIST');
    if (typeof username != 'string') throw new Error('USERNAME_TYPE');
    if (username.length < 3) throw new Error('USERNAME_LENGHT');
  }

  static password(password) {
    if (typeof password != 'string') throw new Error('PASSWORD_TYPE');
    //if(password.length < 6) throw new Error('Password must be at least 6 characters lenght')
    //if(!password.includes("$") || !password.includes("#") || !password.includes("&")) throw new Error('Password must have a character like "#,$,&"')
  }
  static anonimato(anonimato) {
    if (typeof anonimato != 'boolean') throw new Error('ANONIMATO_TYPE');
  }
}
