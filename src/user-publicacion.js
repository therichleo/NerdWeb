// user-publicacion.js
import dbLocal from 'db-local';
import { v4 as uuidv4 } from 'uuid'; // Este se usa para generar id unico
import path from 'path';

const { Schema } = new dbLocal({ path: './db' });

const Media = Schema('Media', {
  id: { type: String, required: true },
  id_user: { type: String, required: true },
  texto: { type: String, required: true },
  descripcion: { type: String, required: false },
});

export class MediaRepository {
  static create({ id_user, texto, descripcion }) {
    const id = uuidv4();

    return Media.create({
      id,
      id_user,
      texto,
      descripcion,
    }).save();
  }

  static findByUserId(id_user) {
    return Media.find({ id_user });
  }

  static getAll() {
    return Media.all();
  }
}
