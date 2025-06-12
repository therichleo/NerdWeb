import dbLocal from 'db-local';

const { Schema } = new dbLocal({ path: './db' });

const Interact = Schema('Interact', {
  userID: { type: String, required: true },
  userIDFollow: { type: Object, required: false },
  userIDFollower: { type: Object, required: false },
});

/*
TEORIA:

VERIFICAMOS SI EL SEGUIDOR Y EL SEGUIDO ESTAN DENTRO DE LA BASE DE DATOS
SI ESTAN DENTRO -> SE PASA DE LARGO
SI NO ESTAN DENTRO -> SE CREAN SUS USUARIOS DENTRO DE LA BASE DE DATOS

LUEGO
USER1: SEGUIDOR
USER2: SEGUIDO

USER1: SIGUE A USER2

USER2: USER 2 LO SIGUE
COMO SON OBJETOS ESTO HACE QUE LA RUTA SEA MUCHO MAS FACIL DE SOBRESCRIBIR Y UN USER PUEDA TENER MUCHOS SEGUIDORES Y SEGUIDOS
AÑA
*/

export class InteractRepository {
  static async follow({ seguidorID, seguidoID }) {
    let registroSeguidor = await Interact.findOne({ userID: seguidorID });
    if (!registroSeguidor) {
      registroSeguidor = await Interact.create({
        userID,
        userIDfollow: {},
        userIDFollower: {},
      });
    }

    let registroSeguido = await Interact.findOne({ userID: seguidoID });
    if (!registroSeguido) {
      registroSeguido = await Interact.create({
        userID,
        userIDfollow: {},
        userIDFollower: {},
      });
    }

    registroSeguidor.userIDFollow[seguidoID] = true;
    registroSeguido.userIDFollower[seguidorID] = true;

    await registroSeguidor.save();
    await registroSeguido.save();
    return true;
  }
}
