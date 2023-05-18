export class BasicLanguage {
  id: number;
  name: string;
}

export class Language extends BasicLanguage {
  code: Languages;
  originalName: string;
}

export enum Languages {
  en = 'en-US',
  es = 'es-ES'
}

export namespace Languages {
  export function toStrArray(): any[] {
    return Object.values(Languages).filter(v => typeof v === 'string');
  }
}
