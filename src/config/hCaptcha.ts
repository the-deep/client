import {
    isDevelopment,
    isBeta,
    isAlpha,
    isStaging,
} from './env';

const getSiteKey = () => {
    if (isDevelopment) {
        return '10000000-ffff-ffff-ffff-000000000001';
    }
    if (isBeta || isAlpha || isStaging) {
        return 'ac332154-0c48-4fc1-9092-e52b291d903c';
    }
    return process.env.REACT_APP_HCATPCHA_SITEKEY as string;
};

export default getSiteKey();
