import { FgRestBuilder } from '#rsu/rest';
import {
    createUrlForEntriesOfLead,
    createParamsForGet,
} from '#rest';

import schema from '#schema';

export default class EntriesRequest {
    constructor(params) {
        const {
            setState,
            setEntries,
        } = params;
        this.setState = setState;
        this.setEntries = setEntries;
    }

    create = (leadId) => {
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForEntriesOfLead(leadId))
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ pendingEntries: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entriesForEditAryGetResponse');
                    this.setEntries({
                        entries: response.results,
                        leadId,
                        lead: response.results[0].lead,
                    });
                    this.setState({ pendingEntries: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                this.setState({ pendingEntries: false });
            })
            .fatal(() => {
                this.setState({ pendingEntries: false });
            })
            .build();
        return entriesRequest;
    }
}
