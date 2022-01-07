import firebaseSDK from '../firebase';
import nookies from 'nookies';
import { client } from '../lib/apollo';

export const logout = async () => {
  await firebaseSDK.auth().signOut();

  await client.clearStore();
  await nookies.destroy(undefined, 'token', { path: '/' });
  return null;
};
