import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import _ts from '#ts';

import { formatTitle } from '#utils/common';

import {
    LEAD_TYPE,
    leadKeySelector,
    supportedFileTypes,

    leadIdSelector,
    isLeadExportDisabled,
    isLeadRemoveDisabled,
    isLeadSaveDisabled,
} from '../utils';

import { LeadProcessorContext } from '../LeadProcessor';
import LeadListItem from '../LeadListItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array.isRequired,
    activeLeadKey: PropTypes.string,
    onLeadSelect: PropTypes.func.isRequired,
    onLeadRemove: PropTypes.func.isRequired,
    onLeadExport: PropTypes.func.isRequired,
    onLeadSave: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    leadStates: PropTypes.object.isRequired,

    onLeadNext: PropTypes.func.isRequired,
    onLeadPrev: PropTypes.func.isRequired,
    leadNextDisabled: PropTypes.bool,
    leadPrevDisabled: PropTypes.bool,
};

const defaultProps = {
    activeLeadKey: undefined,
    className: undefined,
    leadNextDisabled: true,
    leadPrevDisabled: true,
};

function DroppableDiv(p) {
    const {
        className,
        children,
    } = p;

    const { addProcessingLeads } = useContext(LeadProcessorContext);

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
        if (leads.length > 0) {
            addProcessingLeads(leads);
        }
    }, [acceptedFiles, addProcessingLeads]);

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
        } = this.props;

        const leadState = leadStates[key];
        const leadId = leadIdSelector(lead);
        const exportShown = isDefined(leadId);

        const exportDisabled = isLeadExportDisabled(leadState);
        const removeDisabled = isLeadRemoveDisabled(leadState);
        const saveDisabled = isLeadSaveDisabled(leadState);

        const handleExportClick = () => onLeadExport(leadId);
        const handleRemoveClick = () => onLeadRemove(key);
        const handleSaveClick = () => onLeadSave(key);

        const actionButtons = (
            <>
                {exportShown && (
                    <Button
                        className={styles.button}
                        disabled={exportDisabled}
                        onClick={handleExportClick}
                        iconName="openLink"
                    />
                )}
                <Button
                    className={styles.button}
                    disabled={removeDisabled}
                    onClick={handleRemoveClick}
                    iconName="delete"
                />
                <PrimaryButton
                    className={styles.button}
                    disabled={saveDisabled}
                    onClick={handleSaveClick}
                    iconName="save"
                />
            </>
        );

        return {
            active: key === activeLeadKey,
            lead,
            onLeadSelect,
            onLeadRemove,
            onLeadExport,
            onLeadSave,

            leadState: leadStates[key],
            actionButtons,
        };
    }

    render() {
        const {
            leads,
            className,
            onLeadPrev,
            onLeadNext,
            leadPrevDisabled,
            leadNextDisabled,
        } = this.props;

        return (
            <DroppableDiv
                className={_cs(styles.leadListContainer, className)}
            >
                <div className={styles.movementButtons}>
                    <div className={styles.stats}>
                        {/* FIXME: translation */}
                        {`${leads.length} leads`}
                    </div>
                    <div className={styles.actions}>
                        <Button
                            disabled={leadPrevDisabled}
                            onClick={onLeadPrev}
                            iconName="prev"
                            title={_ts('addLeads.actions', 'previousButtonLabel')}
                        />
                        <Button
                            disabled={leadNextDisabled}
                            onClick={onLeadNext}
                            iconName="next"
                            title={_ts('addLeads.actions', 'nextButtonLabel')}
                        />
                    </div>
                </div>
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
