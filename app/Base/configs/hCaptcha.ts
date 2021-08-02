import {
    isBeta,
    isAlpha,
    isNightly,
} from '#base/configs/env';

// eslint-disable-next-line import/prefer-default-export
export const siteKey = isBeta || isAlpha || isNightly
    ? 'ac332154-0c48-4fc1-9092-e52b291d903c'
    : '10000000-ffff-ffff-ffff-000000000001';
