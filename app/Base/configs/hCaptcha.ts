import {
    isBeta,
    isAlpha,
    isStaging,
    isNightly,
} from '#base/configs/env';

const siteKey = (() => {
    const keyFromEnv = process.env.REACT_APP_HCATPCHA_SITEKEY;
    if (keyFromEnv) {
        return keyFromEnv;
    }
    if (isBeta || isAlpha || isStaging || isNightly) {
        return 'ac332154-0c48-4fc1-9092-e52b291d903c';
    }
    return '10000000-ffff-ffff-ffff-000000000001';
})();

export default siteKey;
