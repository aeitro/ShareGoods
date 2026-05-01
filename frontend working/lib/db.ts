import Dexie, { Table } from 'dexie';

export interface OfflineAction {
  id?: number;
  type: 'SEND_MESSAGE' | 'REQUEST_ITEM' | 'UPDATE_STATUS';
  payload: any;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE' | 'GET';
  createdAt: number;
}

export class OfflineDatabase extends Dexie {
  actions!: Table<OfflineAction>;

  constructor() {
    super('OfflineDB');
    this.version(1).stores({
      actions: '++id, type, createdAt'
    });
  }
}

export const db = new OfflineDatabase();
