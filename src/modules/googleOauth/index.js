import { encryptObject, decryptObject } from '@/modules/encryption/credentials';
import { saveIntoAccount, getFromAccount } from '@/modules/encryption/keytar';
import ElectronGoogleOAuth2 from './oauth2Client';

const keytarAccount = 'googleOauth2Token';

// eslint-disable-next-line camelcase
async function saveToken({ refresh_token }) {
  const encryptedToken = await encryptObject({ refresh_token });
  const strToken = JSON.stringify(encryptedToken);
  return saveIntoAccount(keytarAccount, strToken);
}

async function loadToken() {
  const strToken = await getFromAccount(keytarAccount);
  if (strToken === null) return null;
  const encryptedToken = JSON.parse(strToken);
  return decryptObject(encryptedToken);
}

export async function CreateClient() {
  const clientDetails = require('./client_secret.json');
  const myApiOauth = new ElectronGoogleOAuth2(
    clientDetails.client_id,
    clientDetails.client_secret,
    [
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  );

  myApiOauth.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await saveToken(tokens);
    }
  });

  const savedToken = await loadToken();

  if (savedToken !== null) {
    myApiOauth.setTokens(savedToken);
  } else {
    const token = await myApiOauth.openAuthWindowAndGetTokens();
    await saveToken(token);
    myApiOauth.setTokens(token);
  }
  return myApiOauth.oauth2Client;
}

export async function isConnected() {
  return (await loadToken()) !== null;
}
