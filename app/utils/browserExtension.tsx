import { oldExtensionId } from '#base/configs/env';

// FIXME: Use new extension keys for the following after extension is deployed
const EXTENSION_GET_SCREENSHOT = 'get-screenshot';
const EXTENSION_SET_TOKEN = 'set-token';
/*
const EXTENSION_GET_SCREENSHOT = 'deep_extension_le_get-screenshot';
const EXTENSION_SET_TOKEN = 'deep_extension_le_set-token';
*/

interface ScreenshotResponse {
    image: string;
}

// eslint-disable-next-line import/prefer-default-export
export function getScreenshot() {
    const data = {
        message: EXTENSION_GET_SCREENSHOT,
    };

    const promise = new Promise((
        resolve: (r: ScreenshotResponse) => void,
        reject: () => void,
    ) => {
        if (!chrome) {
            reject();
        }

        chrome.runtime.sendMessage(
            oldExtensionId,
            data,
            (response: ScreenshotResponse | undefined) => {
                if (!response) {
                    reject();
                    return;
                }

                resolve(response);
            },
        );
    });

    return promise;
}

export const sendToken = (token: unknown) => {
    const data = {
        message: EXTENSION_SET_TOKEN,
        token,
    };

    const promise = new Promise((resolve: (r: unknown) => void, reject: () => void) => {
        if (!chrome) {
            reject();
        }

        chrome.runtime.sendMessage(oldExtensionId, data, (response) => {
            if (!response) {
                reject();
            }
            resolve(response);
        });
    });

    return promise;
};
