import { extensionId } from '#base/configs/env';

// FIXME: Use new extension keys for the following after extension is deployed
const EXTENSION_GET_SCREENSHOT = 'deep-get-screenshot';

interface ScreenshotResponse {
    image: string;
}

// eslint-disable-next-line import/prefer-default-export
export function getScreenshot() {
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
}
