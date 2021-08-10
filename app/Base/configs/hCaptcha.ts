import {
    isBeta,
    isAlpha,
    isNightly,
} from '#base/configs/env';

const siteKey = isBeta || isAlpha || isNightly
    ? 'ac332154-0c48-4fc1-9092-e52b291d903c'
    : '10000000-ffff-ffff-ffff-000000000001';

export default siteKey;
