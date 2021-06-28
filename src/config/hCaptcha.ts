import { isDevelopment } from './env';

const getSiteKey = () => {
    if (isDevelopment) {
        return '10000000-ffff-ffff-ffff-000000000001';
    }
    return process.env.REACT_APP_HCATPCHA_SITEKEY as string;
};

export default getSiteKey();
