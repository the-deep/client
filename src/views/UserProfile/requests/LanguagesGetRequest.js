import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    urlForLanguages,
    createParamsForGet,
} from '../../../rest';
import schema from '../../../schema';

export default class LanguagesGetRequest {
    constructor(props) {
        this.props = props;
    }

    create = () => {
        const userRequest = new FgRestBuilder()
            .url(urlForLanguages)
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ pendingLanguages: true }); })
            .postLoad(() => { this.props.setState({ pendingLanguages: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'languagesGetResponse');
                    console.warn(response);
                    this.props.setAvailableLanguages(response.results);
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return userRequest;
    }
}
