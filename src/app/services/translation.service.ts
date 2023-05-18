import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Languages } from '../interfaces/languages';

@Injectable({
  providedIn: 'root'
})

export class TranslationService {
  private supportedLanguages = Languages.toStrArray();

  constructor(
    private translate: TranslateService
  ) {
    this.initLang();
  }

  /**
   * Sets the language to translate
   * @param lang - language to use
   */
  use(lang: string): void {
    this.translate.use(lang);
  }

  /**
   * Method uses the first language in response data if one is valid language
   * @param languages is an array of incoming languages.
   */
  setupLanguage(languages: Array<any>): void {
    if (!languages || !languages.length) {
      return;
    }

    const first = languages.shift();
    if (first && this.translate.getLangs().includes(first.code)) {
      this.use(first.code);
    }
  }

  /**
   * Initiation of supported languages and setting the default language to use as a fallback
   */
  private initLang(): void {
    this.translate.addLangs(this.supportedLanguages);
    this.translate.setDefaultLang(Languages.en);
    this.detectAndUseBrowserLang();
  }

    /**
     * Returns a stream of translated values of a key (or an array of keys) which updates
     * whenever the language changes.
     * @returns A stream of the translated key, or an object of translated keys
     */
     stream(key:string): string{
      let value:string = "";
      this.translate.stream(key).subscribe(data => {
        value = data;
      });
      return value;
    }

  /**
   * Detect client's browser language and, use it if one is supported, otherwise the default language is to use
   */
  private detectAndUseBrowserLang(): void {
    const browserLang = this.translate.getBrowserLang();
    const supportedLang = this.supportedLanguages.find(lang => lang.includes(browserLang));
    // const regExp = new RegExp(this.supportedLanguages.join('|'));
    this.use(supportedLang || this.translate.defaultLang);
  }

}
