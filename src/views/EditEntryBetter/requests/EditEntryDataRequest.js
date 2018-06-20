import { FgRestBuilder } from '#rs/utils/rest';
import {
    createUrlEditEntryGet,
    createParamsForGet,
} from '#rest';
import {
    calcEntriesDiff,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
} from '#entities/entry';
import notify from '#notify';
import Request from '#utils/Request';
import _ts from '#ts';
// import schema from '#schema';

export default class EditEntryDataRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingEditEntryData: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingEditEntryData: false });
    }

    handleSuccess = (response) => {
        const {
            lead,
            geoOptions,
            analysisFramework,
            entries,
            regions,
        } = response;
        const { leadId } = this;

        this.parent.setLead({ lead });

        // TODO: notify that analysis framework changed and history cleared
        const oldAf = this.parent.getAf();
        if (oldAf.versionId < analysisFramework.versionId) {
            this.parent.removeAllEntries({ leadId });
        }
        this.parent.setAnalysisFramework({ analysisFramework });

        this.parent.setGeoOptions({
            projectId: lead.project,
            locations: geoOptions,
        });

        this.parent.setRegions({
            projectId: lead.project,
            regions,
        });

        const diffs = calcEntriesDiff(this.parent.getEntries(), entries);

        if (getApplicableDiffCount(diffs) <= 0) {
            return;
        }

        this.parent.diffEntries({ leadId, diffs });

        if (getApplicableAndModifyingDiffCount(diffs) <= 0) {
            return;
        }

        notify.send({
            type: notify.type.WARNING,
            title: _ts('editEntry', 'entryUpdate'),
            message: _ts('editEntry', 'entryUpdateOverridden'),
            duration: notify.duration.SLOW,
        });

        this.parent.setState({ pendingEditEntryData: false });
    }

    init = ({ leadId }) => {
        const url = createUrlEditEntryGet(leadId);
        this.leadId = leadId;

        this.createDefault({
            url,
            params: createParamsForGet,
        });
    }
}
