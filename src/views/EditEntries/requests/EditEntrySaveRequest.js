import {
    createParamsForEntryCreate,
    createParamsForEntryEdit,
    createUrlForEntryEdit,
    urlForEntryCreate,
} from '#rest';
import Request from '#utils/Request';

export default class EditEntrySaveRequest extends Request {
    schemaName = 'entry';

    handlePreLoad = () => {
        const { leadId, entryKey } = this;
        this.parent.setPending({ leadId, entryKey, pending: true });
    }

    handleAfterLoad = () => {
        const { leadId, entryKey } = this;
        this.parent.setPending({ leadId, entryKey, pending: false });
    }

    handleSuccess = (response) => {
        const { leadId, entryKey } = this;
        const { color } = this.parent.calculateEntryData(response.attributes);
        this.parent.saveEntry({
            leadId,
            entryKey,
            response,
            color,
        });
        this.parent.getCoordinator().notifyComplete(entryKey);
    }

    handleFailure = () => {
        const { leadId, entryKey } = this;
        this.parent.setEntryServerError({ leadId, entryKey });
        this.parent.getCoordinator().notifyComplete(entryKey, true);
    }

    handleFatal = () => {
        const { leadId, entryKey } = this;
        this.parent.setEntryServerError({ leadId, entryKey });
        this.parent.getCoordinator().notifyComplete(entryKey, true);
    }

    init = ({ leadId, entryKey, entryData, serverId }) => {
        this.leadId = leadId;
        this.entryKey = entryKey;

        let urlForEntry;
        let paramsForEntry;

        if (serverId) {
            urlForEntry = createUrlForEntryEdit(serverId);
            paramsForEntry = () => createParamsForEntryEdit(entryData);
        } else {
            urlForEntry = urlForEntryCreate;
            paramsForEntry = () => createParamsForEntryCreate(entryData);
        }

        this.createDefault({
            url: urlForEntry,
            params: paramsForEntry,
        });
    }
}
