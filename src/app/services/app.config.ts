import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { IAppConfig } from '../interfaces/app-config.model';

@Injectable()
export class AppConfig {

  static settings: IAppConfig;

  constructor(private http: HttpClient) {
  }

  load(): Promise<void> {
    const jsonFile = `configs/config.${environment.name}.json`;
    return new Promise<void>((resolve, reject) => {
      this.http.get(jsonFile).toPromise().then((response: IAppConfig) => {
        AppConfig.settings = response as IAppConfig;
        resolve();
      }).catch((response: any) => {
        reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
      });
    });
  }
}
