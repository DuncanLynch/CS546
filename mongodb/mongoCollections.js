import {dbConnection} from './mongoConnection.js';
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
export const users = getCollectionFn('Users');
export const classes = getCollectionFn('Classes');
export const profs = getCollectionFn('Professors');