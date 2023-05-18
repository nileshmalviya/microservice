import { Observable } from 'rxjs';
import { ServerResponse } from './server-response';


export interface ListViewFilters {
  searchTerm: string;
  pageIndex: number;
  pageSize: number;

  sortColumn: string;
  sortDescending: boolean;
}

export interface ListViewResults<T> {
  data: T[];
  dataCount: number;
}

export interface ListViewSettings {
  // General
  isGalleryDefault?: boolean;
  allowCreate?: boolean;
  createButtonText?: string;
  allowEdit?: boolean;
  listenToTerritoryChange?: boolean;

  // Gallery
  allowGalleryMode?: boolean;
  gallerySettings?: ListViewGallerySettings;

  // Table
  allowTableMode?: boolean;
  tableSettings?: ListViewTableSettings;
  showActiveState?: boolean;

  // Search
  hideSearch?: boolean;
  searchPlaceholder?: string;

  // Sort
  defaultSortColumn: string;
  defaultSortDirection?: string;

  // Data
  getData: (filters: ListViewFilters) => Observable<ServerResponse<ListViewResults<any>>>;
  create?: () => Observable<boolean>;
  edit?: (item: any) => Observable<boolean>;
}

export interface ListViewGallerySettings {
  createButtonImage?: string;
  imageProperty?: string;
  nameProperty: string;
  linkFunc?: (item: any) => any[];
}

export interface ListViewTableSettings {
  columns: ListViewTableColumn[];
  showExpand?: boolean;
}

export enum ListViewTableColumnType {
  Text = 1,
  Boolean = 2,
  DateTime = 3,
  Date = 4,
  Time = 5,
  Image = 6
}

export interface ListViewTableColumn {
  name: string;
  displayText: string;
  columnType: ListViewTableColumnType;
  allowSort?: boolean;
  emptyText?: string;
  parser?: (item: any) => any;
  linkFunc?: (item: any) => any[];
}
