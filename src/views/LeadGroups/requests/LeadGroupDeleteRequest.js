import { FgRestBuilder } from '#rsu/rest';
import notify from '#notify';
import {
    createUrlForLeadGroupDelete,
    createParamsForLeadGroupDelete,
    transformResponseErrorToFormError,
} from '#rest';

import _ts from '#ts';

export default class LeadGroupDeleteRequest {
    constructor(params) {
        const {
            pullLeadGroups,
            setState,
        } = params;
        this.pullLeadGroups = pullLeadGroups;
        this.setState = setState;
    }

    create = (leadGroup) => {
        const { id } = leadGroup;
        const leadGroupsRequest = new FgRestBuilder()
            .url(createUrlForLeadGroupDelete(id))
            .params(() => createParamsForLeadGroupDelete())
            .preLoad(() => {
                this.setState({ deleteLeadGroupPending: true });
            })
            .postLoad(() => {
                this.setState({ deleteLeadGroupPending: false });
            })
            .success(() => {
                notify.send({
                    title: _ts('leadGroups', 'leadGroupsTitle'),
                    type: notify.type.SUCCESS,
                    message: _ts('leadGroups', 'leadGroupDeleteSuccess'),
                    duration: notify.duration.MEDIUM,
                });
                this.pullLeadGroups();
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('leadGroups', 'leadGroupsTitle'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leadGroups', 'leadGroupsTitle'),
                    type: notify.type.ERROR,
                    message: _ts('leadGroups', 'leadGroupDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return leadGroupsRequest;
    }
}
