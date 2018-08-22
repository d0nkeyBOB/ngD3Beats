import request from 'request';

import winston from 'winston';
import moment from 'moment';
import jwt from 'jsonwebtoken';

import { encrypt, decrypt } from './util';
import KinveyService from './kinvey';

import config from '../config';

const SERVER_URL = config.server.auth.url;
const DEFAULT_CONNECTION = 'iop-connection';

const DEFAULT_DFL_CLIENTID = 'testid';

const DEFAULT_DBOS_CLIENTID = 'testid2';

let savedToken = undefined, kinvey = null;

/**
 * This class includes methods to obtain Refresh Tokens and ID Tokens
 */
 class TokenService {

   constructor() {
     kinvey = new KinveyService();
   }


  getRefreshToken(req, config) {

    const serverUrl = `${SERVER_URL}/oauth/ro`;
    const service = config.service && config.service.toLowerCase();

    const defaultHeaders = {
      'content-type': 'application/json',
      'cache-control': 'no-cache',
      'host': 'schneider-electric.auth0.com'
    };

    const defaultOptions = {
      connection: 'iop-connection',
      grant_type: 'password',
      scope: 'openid offline_access'
    };

    let client_id = config.client_id || (service === 'dbos' &&  DEFAULT_DBOS_CLIENTID) || DEFAULT_DFL_CLIENTID;

    let data = Object.assign(defaultOptions, {
      client_id: client_id,
      connection: (config.connection || DEFAULT_CONNECTION),
      username : config.username,
      password : config.password,
      device: config.device
    });

    let options = {
      method: 'POST',
      url : serverUrl,
      headers: defaultHeaders,
      form : data
    };
    return new Promise((resolve, reject) => {

      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          let token = JSON.parse(body);
          token = encrypt(token.refresh_token);
          //var expiration = Date now() + token.expiration;
          resolve(token);
        } else {
          reject({
            statusCode : (response && response.statusCode) || 401, // Unauthorized
            error : error || body
          });
        }
      });
      // }
    });
  }


  getIdToken(req, config) {

    const serverUrl = `${SERVER_URL}/delegation`;
    const service = config.service && config.service.toLowerCase()

    let client_id = config.client_id || (service === 'dbos' &&  DEFAULT_DBOS_CLIENTID) || DEFAULT_DFL_CLIENTID
    let decryptedToken, cacheToken = null, parsedBody;

    const defaultHeaders = {
      'content-type': 'application/x-www-form-urlencoded',
      'cache-control': 'no-cache',
      'host': 'schneider-electric.auth0.com',
    };

    const defaultOptions = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      scope: 'openid profile',
      api_type: 'app'
    };


    decryptedToken = decrypt(config.refresh_token);
    // }

    let data = Object.assign(defaultOptions, {
      client_id: client_id,
      refresh_token: decryptedToken,
      target: client_id,
    });

    let options = {
      method: 'POST',
      url : serverUrl,
      headers: defaultHeaders,
      form : data
    };

    console.time('request_id_token');

    return new Promise((resolve, reject) => {
      let token = this.checkToken(config);
      token.then((data) => {
        if (data !== null) {
          parsedBody = {
            'refresh_token': decrypt(data.refresh_token),
            'id_token': decrypt(data.id_token),
            'token_type': data.token_type
          }

          resolve({
            statusCode: 200, // Unauthorized
            body: parsedBody
          });
        } else {

          request(options, function(error, response, body) {

            console.timeEnd('request_id_token');

            if (!error && response.statusCode == 200) {

              parsedBody = JSON.parse(body);

              cacheToken = {
                'refresh_token': encrypt(config.refresh_token),
                'id_token': encrypt(parsedBody.id_token),
                'token_type': parsedBody.token_type
              }

              kinvey.save(cacheToken);

              resolve({
                statusCode : 200, // Unauthorized
                body : parsedBody
              });
            } else {
              winston.log('error', '%s', JSON.stringify(error));
              reject({
                statusCode : (response && response.statusCode) || 401, // Unauthorized
                error : error || body
              });
            }
          });

        }
      }).catch((error) => {
        winston.log('error', '%s', JSON.stringify(error));
        reject({
            statusCode: 401, // unauthorized
            error: error
          });
      });

    });
  }


  checkToken(refresh_token) {
  return new Promise((resolve, reject) => {
    kinvey.get(refresh_token).then((cache) => {
      if(cache.length > 0) {
        let checkToken = jwt.decode(decrypt(cache[0].id_token));
        let checkDate = Date.now() / 1000;
        let isExpired = checkDate < checkToken.exp;
        if(isExpired) {
          resolve(cache[0]);
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }


    }).catch((error) => {
      winston.log('error', '%s', JSON.stringify(error));
      reject(false);
    });
  });
  }


}

export { TokenService as default }
