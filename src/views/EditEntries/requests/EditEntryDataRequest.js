import {
    createUrlEditEntryGet,
    createParamsForGet,
} from '#rest';
import {
    createDiff,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
} from '#entities/editEntries';
import notify from '#notify';
import Request from '#utils/Request';
import _ts from '#ts';

export default class EditEntryDataRequest extends Request {
    schemaName = 'entriesForEditEntriesGetResponse';

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

        const projectIdFromUrl = this.parent.getProjectId();
        if (projectIdFromUrl !== lead.project) {
            this.parent.setState({ projectMismatch: true });
            console.error(`Expected project id to be ${projectIdFromUrl}, but got ${lead.project}`);
            return;
        }
        this.parent.setState({ projectMismatch: false });

        this.parent.setLead({ lead });

        this.parent.setAnalysisFramework({ analysisFramework });

        this.parent.setGeoOptions({
            projectId: lead.project,
            locations: geoOptions,
        });

        this.parent.setRegions({
            projectId: lead.project,
            regions,
        });

        const diffs = createDiff(this.parent.getEntries(), entries);


        if (getApplicableDiffCount(diffs) <= 0) {
            this.parent.setEntriesCommentsCount({ leadId, entries });
            return;
        }

        // Calculate color for each entry in the diff
        diffs.forEach((acc) => {
            const { entry: { data: { attributes = {} } = {} } = {} } = acc;
            if (acc.entry) {
                const color = this.parent.calculateEntryColor(
                    attributes,
                    analysisFramework,
                );
                acc.entry.localData.color = color;
            }
        });

        this.parent.setEntries({ leadId, entryActions: diffs });
        this.parent.setEntriesCommentsCount({ leadId, entries });


        if (getApplicableAndModifyingDiffCount(diffs) <= 0) {
            return;
        }

        notify.send({
            type: notify.type.WARNING,
            title: _ts('editEntry', 'entryUpdate'),
            message: _ts('editEntry', 'entryUpdateOverridden'),
            duration: notify.duration.SLOW,
        });
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
