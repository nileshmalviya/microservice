export class DateTimeModel {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export class FileContainer {
  path: string;
  upload: boolean;
  delete: boolean;

  // Client Only
  file: File;
}
