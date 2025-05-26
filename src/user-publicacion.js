import dbLocal from 'db-local';
import fs from 'fs';
import { type } from 'os';
import path from 'path';

const { Schema } = new dbLocal({ path: './db' });

const Media = Schema('Media', {
  id: { type: String, required: true },
  id_user: { type: String, required: true },
  texto: { type: String, required: true },
  descripcion: { type: String, required: true },
});

export class mediaRepository {
  static create({ id, id_user, texto, descripcion }) {}
}
