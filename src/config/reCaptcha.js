import { isDevelopment } from './env';

const getSiteKey = () => {
    if (process.env.REACT_APP_RECAPTCHA_SITE_KEY) {
        return process.env.REACT_APP_RECAPTCHA_SITE_KEY;
    }
    return isDevelopment
        ? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
        : '6LdPGpoUAAAAAFLC0TwfQ1xdxGQOEizy2GyvQ3XJ';
};

// eslint-disable-next-line
export const reCaptchaSiteKey = getSiteKey();
