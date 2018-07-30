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
            .delay(0)
            .preLoad(() => this.props.setState({ pendingLanguage: true }))
            .postLoad(() => this.props.setState({ pendingLanguage: false }))
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'language');
                    this.props.setLanguage(response);
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return languageRequest;
    }
}
