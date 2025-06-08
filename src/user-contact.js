import dbLocal from 'db-local';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = new dbLocal({ path: './db' });

const Contact = Schema('Contact', {
  id: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  is_user: { type: Boolean, required: true },
});

export class ContactRepository {
  static create({ email, text, boolean }) {
    const id = uuidv4();

    return Contact.create({
      id,
      email,
      text,
      is_user: boolean,
    }).save();
  }
}
