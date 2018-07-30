import { FgRestBuilder } from '#rsu/rest';

import {
    urlForLanguages,
    createParamsForGet,
} from '#rest';
import schema from '#schema';
import AbstractTask from '#utils/AbstractTask';

import { setAvailableLanguagesAction } from '../../reducers/lang';
import { setWaitingForAvailableLanguagesAction } from '../../reducers/app';

// NOTE: languages is pulled only at app initialization
export default class LanguagesGet extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
    }

    createLanguagesRequest = (store) => {
        const userRequest = new FgRestBuilder()
            .url(urlForLanguages)
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'languagesGetResponse');
                    store.dispatch(setAvailableLanguagesAction(response.results));
                    store.dispatch(setWaitingForAvailableLanguagesAction(false));
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return userRequest;
    }

    start = () => {
        this.stop();

        this.languagesRequest = this.createLanguagesRequest(this.store);
        this.languagesRequest.start();
    }

    stop = () => {
        if (this.languagesRequest) {
            this.languagesRequest.stop();
        }
    }
}
