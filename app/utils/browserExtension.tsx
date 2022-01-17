import { extensionId } from '#base/configs/env';

const EXTENSION_GET_SCREENSHOT = 'deep_extension_le_get-screenshot';
const EXTENSION_SET_TOKEN = 'deep_extension_le_set-token';

interface ScreenshotResponse {
    image: string;
}

export const getScreenshot = () => {
    const data = {
        message: EXTENSION_GET_SCREENSHOT,
    };

    const promise = new Promise((resolve: (r: ScreenshotResponse) => void, reject: () => void) => {
        if (!chrome) {
            reject();
        }

        chrome.runtime.sendMessage(extensionId, data, (response: ScreenshotResponse) => {
            if (!response) {
                reject();
            }

            resolve(response);
        });
    });

    return promise;
};

export const sendToken = (token: unknown) => {
    const data = {
        message: EXTENSION_SET_TOKEN,
        token,
    };

    const promise = new Promise((resolve: (r: unknown) => void, reject: () => void) => {
        if (!chrome) {
            reject();
        }

        chrome.runtime.sendMessage(extensionId, data, (response) => {
            if (!response) {
                reject();
            }
            resolve(response);
        });
    });

    return promise;
};
