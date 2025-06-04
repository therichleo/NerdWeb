// user-publicacion.js
import dbLocal from 'db-local';
import { v4 as uuidv4 } from 'uuid'; // Este se usa para generar id unico
import path from 'path';
import { text } from 'stream/consumers';

const { Schema } = new dbLocal({ path: './db' });

const Media = Schema('Media', {
  id: { type: String, required: true },
  id_user: { type: String, required: true },
  titulo: { type: String, required: true },
  texto: { type: String, required: true },
  descripcion: { type: String, required: false },
  categoria: { type: String, required: true },
  createdAt: { type: Number, required: true },
});

export class MediaRepository {
  static create({ id_user, titulo, texto, descripcion, categoria }) {
    const id = uuidv4();
    const createdAt = Date.now();

    console.log('createdAt:', createdAt, 'is Date:', createdAt instanceof Date);

    return Media.create({
      id,
      id_user,
      titulo,
      texto,
      descripcion,
      categoria,
      createdAt,
    }).save();
  }

  static getByUserID(userId) {
    return Media.find({ id_user: userId });
  }

  static getAll() {
    return Media.find({});
  }
}
