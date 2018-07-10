import Request from '#utils/Request';
import {
    createUrlForFilteredEntries,
    createParamsForFilteredEntries,
} from '#rest';

export default class EntriesRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingEntries: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingEntries: false });
    }

    handleSuccess = (entries) => {
        this.parent.setEntries({ entries });
    }

    getUrl = () => (
        createUrlForFilteredEntries({
            offset: this.parent.getOffset(),
            limit: this.parent.getLimit(),
        })
    )

    getParam = () => (
        createParamsForFilteredEntries(this.parent.getFilters())
    )

    init = () => {
        this.createDefault({
            url: this.getUrl,
            params: this.getParam,
        });
    }
}
