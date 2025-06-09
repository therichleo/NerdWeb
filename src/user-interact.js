import dbLocal from 'db-local';

const { Schema } = new dbLocal({ path: './db' });

const Interact = Schema('Interact', {
  userID: { type: String, required: true },
  userIDFollower: { type: String, required: false },
  userIDFollow: { type: String, required: false },
});

const InteractArreglado = Schema('InteractArreglado', {
  userID: { type: String, required: true },
  userIDFollowArray: { type: Array, required: false },
  userIDFollowerArray: { type: Array, required: false },
});

export class FollowerRepository {
  static create({ userID, userIDFollow, userIDFollower }) {
    return Interact.create({
      userID,
      userIDFollow,
      userIDFollower,
    });
  }

  static ArreglarJson({ userID }) {
    const data = Interact.find({ userID });
    const ArrFollows = [];
    const ArrFollowers = [];
    for (const interacciones of data) {
      ArrFollows.push(interacciones.userIDFollows);
      ArrFollowers.push(interacciones.userIDFollower);
    }
    return InteractArreglado.create({
      userID,
      userIDFollowArray,
      userIDFollowerArray,
    });
  }
}
