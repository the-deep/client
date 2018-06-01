import { RestRequest } from '#rs/utils/rest';
import schema from '#schema';
import { alterResponseErrorToFaramError } from '#rest';

const requestNotCreatedMessage = 'Request.start() called before it was initialized/';

export default class Request {
    constructor(parent) {
        this.parent = parent;
        this.delay = 50;

        this.retryTime = 1000;
        this.maxRetryAttempts = 5;

        this.schemaName = undefined;
    }

    start = () => {
        if (this.request) {
            this.request.start();
        } else {
            console.warn(requestNotCreatedMessage);
        }
    }

    stop = () => {
        if (this.request) {
            this.request.stop();
        }
    }

    createDefault = (createOptions) => {
        this.createOptions = createOptions;

        const {
            url,
            createParams,
            params,
        } = createOptions;

        const paramFn = () => createParams(params);

        const successInterceptor = (response) => {
            if (this.schemaName !== undefined) {
                try {
                    schema.validate(response, this.schemaName);
                } catch (e) {
                    console.error(e);
                }
                this.handleSuccess(response);
            } else {
                console.warn('Validation is not defined');
                this.handleSuccess(response);
            }
        };

        const failureInterceptor = (response) => {
            const newResponse = alterResponseErrorToFaramError(response);
            this.handleFailure(newResponse);
        };

        const handleSuccess = this.handleSuccess ? successInterceptor : undefined;
        const handleFailure = this.handleFailure ? failureInterceptor : undefined;

        const request = new RestRequest(
            url,
            paramFn,
            handleSuccess,
            handleFailure,
            this.handleFatal,
            this.handleAbort,
            this.handlePreLoad,
            this.handlePostLoad,
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
