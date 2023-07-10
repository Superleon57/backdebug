import axios from 'axios';
import { parse } from 'js2xmlparser';

export default class PrestaShopClient {
  urlParams: {} = {};

  constructor(private url: any, private key: any) {
    this.url = url;
    this.key = key;
  }

  checkStatusCode(status_code) {
    switch (status_code) {
      case 200:
      case 201:
        break;
      case 204:
        throw new Error(status_code + ': No content');
      case 400:
        throw new Error(status_code + ': Bad Request');
      case 401:
        throw new Error(status_code + ': Unauthorized');
      case 404:
        throw new Error(status_code + ': Not Found');
      case 405:
        throw new Error(status_code + ': Method Not Allowed');
      case 500:
        throw new Error(status_code + ': Internal Server Error');
      default:
        throw new Error('This call to PrestaShop Web Services returned an unexpected HTTP status of:' + status_code);
    }
  }

  formatUrl() {
    this.url += '?ws_key=' + this.key + '&output_format=JSON&display=full';
    if (Object.keys(this.urlParams).length > 0) {
      const params = new URLSearchParams(this.urlParams).toString();
      this.url += '&' + params;
    }
  }

  executeRequest(request: any): Promise<any> {
    this.formatUrl();
    return axios({
      method: request.method,
      url: this.url,
      data: request.data,
      headers: {
        ...request.headers,
      },
    });
  }

  public async get(options: any): Promise<any> {
    const { url, resource, id } = options;
    if (url) {
      this.url = url;
    } else if (resource) {
      this.url = this.url + '/api/' + resource;
      if (id) {
        this.url += '/' + id;
      }

      const params = ['filter', 'display', 'sort', 'limit', 'id_shop', 'id_group_shop', 'schema', 'language', 'date', 'price'];
      for (const param of params) {
        Object.keys(options).forEach(key => {
          if (key.includes(param)) {
            this.urlParams[key] = options[key];
          }
        });
      }
    } else {
      throw new Error('Bad parameters given');
    }

    const headers = { 'Content-Type': 'application/json' };
    const response = await this.executeRequest({ method: 'GET', url: this.url, headers });

    this.checkStatusCode(response.status);
    return response.data;
  }

  public async post(options: any): Promise<any> {
    const { url, resource, data } = options;
    if (url) {
      this.url = url;
    } else if (resource) {
      this.url = this.url + '/api/' + resource;
    } else {
      throw new Error('Bad parameters given');
    }

    const params = ['id_shop', 'id_group_shop'];
    for (const param of params) {
      if (options[param]) {
        this.urlParams[param] = options[param];
      }
    }

    const xmlData = parse('prestashop', data);

    const headers = { 'Content-Type': 'application/xml' };
    const response = await this.executeRequest({ method: 'POST', url: this.url, data: xmlData, headers });

    this.checkStatusCode(response.status);
    return response.data;
  }
}
