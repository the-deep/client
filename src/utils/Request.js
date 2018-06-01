import { RestRequest } from '#rs/utils/rest';

const requestNotCreatedMessage = 'Request -> start() called before it was created';

export default class Request {
    constructor(parent) {
        this.parent = parent;
        this.delay = 50;

        this.retryTime = 1000;
        this.maxRetryAttempts = 5;
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

        const request = new RestRequest(
            url,
            paramFn,
            this.handleSuccess,
            this.handleFailure,
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
