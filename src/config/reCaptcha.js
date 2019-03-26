import { isDevelopment } from './env';

const getSiteKey = () => {
    if (isDevelopment) {
        return '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
    }
    return '6LdPGpoUAAAAAFLC0TwfQ1xdxGQOEizy2GyvQ3XJ';
};

// eslint-disable-next-line
export const reCaptchaSiteKey = getSiteKey();
