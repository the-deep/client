import { RestRequest } from '#rsu/rest';
import schema from '#schema';
import { alterResponseErrorToFaramError } from '#rest';

const requestNotCreatedForStartMessage = 'REQUEST: start() called before init()';
const requestNotCreatedForStopMessage = 'REQUEST: stop() called before init()';
const validationNotDefinedMessage = 'REQUEST: Validation is not defined';

export default class Request {
    constructor(parent, { delay = 50, retryTime = 1000, maxRetryAttempts = 5 } = {}) {
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

    successInterceptor = (response) => {
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

    failureInterceptor = (response) => {
        const newResponse = alterResponseErrorToFaramError(response.errors);
        this.handleFailure(newResponse);
    }

    createDefault = (createOptions) => {
        this.stop();

        this.createOptions = createOptions;

        const {
            url,
            params,
        } = createOptions;

        const request = new RestRequest(
            url,
            params,
            this.handleSuccess ? this.successInterceptor : undefined,
            this.handleFailure ? this.failureInterceptor : undefined,
            this.handleFatal,
            this.handleAbort,
            this.handlePreLoad,
            this.handlePostLoad,
            this.handleAfterLoad,
            this.retryTime,
            this.maxRetryTime,
            this.decayVal,
            this.maxRetryAttempts,
            this.pollTime,
            this.maxPollAttempts,
            this.shouldPoll,
            this.delay,
        );

        this.request = request;
    }
}
