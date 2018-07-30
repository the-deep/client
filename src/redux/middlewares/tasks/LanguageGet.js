import { BgRestBuilder } from '#rsu/rest';

import {
    createParamsForGet,
    createUrlForLanguage,
} from '#rest';
import schema from '#schema';

export default class LanguageGet {
    constructor(props) {
        this.props = props;
    }

    create = (languageCode) => {
        const languageRequest = new BgRestBuilder()
            .url(createUrlForLanguage(languageCode))
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'language');
                    this.props.setLanguage(response);
                    this.props.setWaitingForLanguage(false);
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return languageRequest;
    }
}
