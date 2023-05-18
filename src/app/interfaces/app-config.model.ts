export interface IAppConfig {
  env: {
    name: string;
  };

  isDebug: boolean;
  apiServer: string;
  localServer: string;
  internetspeed:number;
  selectedlanguage:string;
}
