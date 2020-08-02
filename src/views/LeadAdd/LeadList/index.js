import React from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

import ListView from '#rscv/List/ListView';
import { formatTitle } from '#utils/common';

import {
    LEAD_TYPE,
    leadKeySelector,
    supportedFileTypes,
} from '../utils';

import LeadListItem from './LeadListItem';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array.isRequired,
    activeLeadKey: PropTypes.string,
    onLeadSelect: PropTypes.func.isRequired,
    onLeadRemove: PropTypes.func.isRequired,
    onLeadExport: PropTypes.func.isRequired,
    onLeadSave: PropTypes.func.isRequired,
    onLeadsAdd: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    fileUploadStatuses: PropTypes.object.isRequired,
};

const defaultProps = {
    activeLeadKey: undefined,
};

function DroppableDiv(p) {
    const {
        className,
        children,
        onLeadsAdd,
    } = p;

    const {
        acceptedFiles,
        getRootProps,
    } = useDropzone({ accept: supportedFileTypes });

    React.useEffect(() => {
        const leads = acceptedFiles.map((file) => {
            const lead = {
                faramValues: {
                    title: formatTitle(file.name),
                    sourceType: LEAD_TYPE.file,
                },
                file,
            };
            return lead;
        });
        onLeadsAdd(leads);
    }, [acceptedFiles, onLeadsAdd]);

    return (
        <div {...getRootProps({ className })}>
            { children }
        </div>
    );
}

class LeadList extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    rendererParams = (key, lead) => {
        const {
            activeLeadKey,
            onLeadSelect,
            onLeadRemove,
            onLeadExport,
            onLeadSave,
            leadStates,
            fileUploadStatuses,
        } = this.props;

        return {
            active: key === activeLeadKey,
            lead,
            onLeadSelect,
            onLeadRemove,
            onLeadExport,
            onLeadSave,

            leadState: leadStates[key],
            progress: fileUploadStatuses[key] ? fileUploadStatuses[key].progress : undefined,
        };
    }

    render() {
        const {
            leads,
            onLeadsAdd,
        } = this.props;

        return (
            <DroppableDiv
                className={styles.leadListContainer}
                onLeadsAdd={onLeadsAdd}
            >
                <ListView
                    className={styles.leadList}
                    data={leads}
                    keySelector={leadKeySelector}
                    renderer={LeadListItem}
                    rendererParams={this.rendererParams}
                />
            </DroppableDiv>
        );
    }
}

export default LeadList;
