import {
    isDevelopment,
    isBeta,
    isAlpha,
    isNightly,
} from '#base/configs/env';

const siteKey = (() => {
    const keyFromEnv = process.env.REACT_APP_HCATPCHA_SITEKEY as string | undefined;
    if (keyFromEnv) {
        return keyFromEnv;
    }
    if (isDevelopment) {
        return '10000000-ffff-ffff-ffff-000000000001';
    }
    if (isBeta || isAlpha || isNightly) {
        return 'ac332154-0c48-4fc1-9092-e52b291d903c';
    }
    return undefined;
})();

export default siteKey;
