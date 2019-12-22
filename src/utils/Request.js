import { RestRequest } from '@togglecorp/react-rest-request';

import schema from '#schema';
import { alterResponseErrorToFaramError } from '#rest';

const requestNotCreatedForStartMessage = 'REQUEST: start() called before init()';
const validationNotDefinedMessage = 'REQUEST: Validation is not defined';

export default class Request {
    constructor(parent, { delay, retryTime, maxRetryAttempts } = {}) {
        this.parent = parent;

        this.delay = delay;

        this.retryTime = retryTime;
        this.maxRetryAttempts = maxRetryAttempts;

        this.schemaName = undefined;
    }

    handleFatal = () => {
        // console.warn(error);
    }

    start = () => {
        if (this.request) {
            this.request.start();
        } else {
            console.error(requestNotCreatedForStartMessage);
        }
    }

    stop = () => {
        if (this.request) {
            this.request.stop();
        }
        /*
        else {
            console.error(requestNotCreatedForStopMessage);
        }
        */
    }

    successInterceptor = (key, response) => {
        if (this.schemaName !== undefined) {
            try {
                schema.validate(response, this.schemaName);
            } catch (e) {
                console.error('NETWORK ERROR:', e);
                this.handleFatal({ errorMessage: e, errroCode: null });
                return;
            }
        } else {
            console.warn(validationNotDefinedMessage);
        }

        this.handleSuccess(response);
    }

    failureInterceptor = (key, response) => {
        const newResponse = alterResponseErrorToFaramError(response.errors);
        this.handleFailure(newResponse, response);
    }

    fatalInterceptor = (key, response) => {
        this.handleFatal(response);
    }

    createDefault = (createOptions) => {
        this.stop();

        this.createOptions = createOptions;

        const {
            url,
            params,
        } = createOptions;

        const request = new RestRequest({
            key: 'unknown',
            url,
            params,

            delay: this.delay,

            shouldPoll: this.shouldPoll,
            pollTime: this.pollTime,
            maxPollAttempts: this.maxPollAttempts,

            onAbort: this.handleAbort,
            onPreLoad: this.handlePreLoad,
            onSuccess: this.handleSuccess ? this.successInterceptor : undefined,
            onFailure: this.handleFailure ? this.failureInterceptor : undefined,
            onFatal: this.handleFatal ? this.fatalInterceptor : undefined,
            onPostLoad: this.handlePostLoad,
            onAfterLoad: this.handleAfterLoad,

            // shouldRetry, (new)
            retryTime: this.retryTime,
            maxRetryAttempts: this.maxRetryAttempts,

            // this.maxRetryTime, (obsolete)
            // this.decayVal, (obsolete)
        });

        this.request = request;
    }
}
