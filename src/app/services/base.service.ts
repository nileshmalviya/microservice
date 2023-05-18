import {Observable} from 'rxjs';
import {ServerResponse} from '../interfaces/server-response';
import {AppConfig} from './app.config';
import {HttpClient, HttpHeaders} from '@angular/common/http';

export abstract class BaseService {

    protected constructor(protected http: HttpClient) {
    }

    // **************************************************************** //
    // *************************** Local ****************************** //
    // **************************************************************** //
    public getServerUrl(url: string): string {
        return AppConfig.settings.apiServer + '/' + url;
    }

    public getServerResourceUrl(url: string): string {
        return AppConfig.settings.apiServer + '/' + url;
    }

    // **************************************************************** //
    // ************************** Helpers ***************************** //
    // **************************************************************** //

    protected get<T>(url: string): Observable<ServerResponse<T>> {
        return this.getClean<ServerResponse<T>>(url);
    }
   
    protected post<T>(url: string, data: any): Observable<ServerResponse<T>> {
        return this.postClean<ServerResponse<T>>(url, data);
    }

    protected getClean<T>(url: string): Observable<T> {
        return this.http.get<T>(this.getServerUrl(url), {
            withCredentials: true
        });
    }

    protected postClean<T>(url: string, data: any): Observable<T> {
        return this.http.post<T>(this.getServerUrl(url), data, {
            withCredentials: true
        });
    }

    protected getWithAuth<T>(url: string): Observable<ServerResponse<T>> {
        return this.getCleanWithAuth<ServerResponse<T>>(url);
    }

    protected getCleanWithAuth<T>(url: string): Observable<T> {
        let token = sessionStorage.getItem('token')? sessionStorage.getItem('token'): localStorage.getItem('token')
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+token,
        });
        return this.http.get<T>(this.getServerUrl(url), {
            headers: headers,
            withCredentials: true
        });
    }

    protected postWithAuth<T>(url: string, data: any): Observable<ServerResponse<T>> {
        return this.postCleanWithAuth<ServerResponse<T>>(url, data);
    }

    protected postCleanWithAuth<T>(url: string, data: any): Observable<T> {
        let token = sessionStorage.getItem('token')? sessionStorage.getItem('token'): localStorage.getItem('token')
        const headers = new HttpHeaders({
          //  'Content-Type': 'application/json',
            Authorization: 'Bearer '+ token,
        });
        return this.http.post<T>(this.getServerUrl(url), data, {
            headers:headers,
            withCredentials: true
        });
    }
}
