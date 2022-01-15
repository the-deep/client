import localforage from 'localforage';
import { myApp } from '#base/configs/env';

const localforageInstance = localforage.createInstance({
    name: myApp,
    version: 1.0,
    storeName: 'backup',
    description: 'Store local backup',
});

export default localforageInstance;
