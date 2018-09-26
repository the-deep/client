import { BgRestBuilder } from '#rsu/rest';

import {
    createUrlForLanguage,
    createParamsForLanguagePut,
} from '#rest';
import schema from '#schema';

export default class LanguagePut {
    constructor(props) {
        this.props = props;
    }

    create = (languageCode, strings, links) => {
        const languageRequest = new BgRestBuilder()
            .url(createUrlForLanguage(languageCode))
            .params(() => createParamsForLanguagePut({ strings, links }))
            .preLoad(() => this.props.setState({ pendingLanguagePut: true }))
            .postLoad(() => this.props.setState({ pendingLanguagePut: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'language');
                    this.props.clearChanges();
                    this.props.setLanguage(response);
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return languageRequest;
    }
}
