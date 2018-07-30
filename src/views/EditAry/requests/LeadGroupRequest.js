import { FgRestBuilder } from '#rsu/rest';
import {
    createUrlForLeadGroup,
    createParamsForGet,
} from '#rest';
import schema from '#schema';

export default class LeadGroupRequest {
    constructor(parent) {
        this.parent = parent;
        this.request = {
            start: () => { console.warn('Request -> start() called before it was created'); },
            stop: () => {},
        };
    }

    createRequest = (leadGroupId) => {
        const url = createUrlForLeadGroup(leadGroupId);

        this.request = new FgRestBuilder()
            .url(url)
            .params(createParamsForGet)
            .preLoad(() => this.parent.setState({ pendingLead: true }))
            .postLoad(() => this.parent.setState({ pendingLead: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'leadGroup');
                    this.parent.setState({ leadGroup: response });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
    }
}
