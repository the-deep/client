import {
    createUrlForDeleteEntry,
    createParamsForDeleteEntry,
} from '#rest';
import Request from '#utils/Request';

export default class EditEntryDeleteRequest extends Request {
    handlePreLoad = () => {
        const { leadId, entryKey } = this;
        this.parent.setPending({ leadId, entryKey, pending: true });
    }

    handleAfterLoad = () => {
        const { leadId, entryKey } = this;
        this.parent.setPending({ leadId, entryKey, pending: false });
    }

    handleSuccess = () => {
        const { leadId, entryKey } = this;
        this.parent.removeEntry({
            leadId,
            key: entryKey,
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

    init = ({ leadId, entryKey, serverId }) => {
        this.leadId = leadId;
        this.entryKey = entryKey;

        this.createDefault({
            url: createUrlForDeleteEntry(serverId),
            params: createParamsForDeleteEntry,
        });
    }
}
