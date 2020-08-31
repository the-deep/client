import PropTypes from 'prop-types';
import React from 'react';
import {
    isDefined,
} from '@togglecorp/fujs';


import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import Jumper from '#components/general/Jumper';

import _cs from '#cs';

import {
    LEAD_TYPE,
    LEAD_STATUS,
    leadKeySelector,
    leadSourceTypeSelector,
    leadFaramValuesSelector,
    leadIdSelector,

    isLeadExportDisabled,
    isLeadRemoveDisabled,
    isLeadSaveDisabled,
} from '../../utils';

import styles from './styles.scss';

// FIXME: it doesn't make much sense to include the icon anymore
const leadTypeToIconClassMap = {
    [LEAD_TYPE.drive]: 'googleDrive',
    [LEAD_TYPE.dropbox]: 'dropbox',
    [LEAD_TYPE.file]: 'upload',
    [LEAD_TYPE.website]: 'globe',
    [LEAD_TYPE.text]: 'clipboard',
    [LEAD_TYPE.connectors]: 'link',
};

const styleMap = {
    [LEAD_STATUS.warning]: styles.warning,
    [LEAD_STATUS.requesting]: styles.pending,
    [LEAD_STATUS.uploading]: styles.pending,
    [LEAD_STATUS.invalid]: styles.error,
    [LEAD_STATUS.nonPristine]: styles.pristine,
    [LEAD_STATUS.complete]: styles.complete,
};

const iconMap = {
    [LEAD_STATUS.warning]: 'warning',
    [LEAD_STATUS.requesting]: 'loading',
    [LEAD_STATUS.uploading]: 'loading',
    [LEAD_STATUS.invalid]: 'error',
    [LEAD_STATUS.nonPristine]: 'codeWorking',
    [LEAD_STATUS.complete]: 'checkCircle',
};

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
    leadState: PropTypes.string,
    progress: PropTypes.number,

    onLeadSelect: PropTypes.func.isRequired,
    onLeadRemove: PropTypes.func.isRequired,
    onLeadExport: PropTypes.func.isRequired,
    onLeadSave: PropTypes.func.isRequired,
    active: PropTypes.bool,
};

const defaultProps = {
    active: false,
    className: undefined,
    leadState: undefined,
    progress: undefined,
};

export default class LeadListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const {
            onLeadSelect,
            lead,
        } = this.props;
        const leadKey = leadKeySelector(lead);
        onLeadSelect(leadKey);
    }

    handleSaveClick = () => {
        const {
            onLeadSave,
            lead,
        } = this.props;
        const leadKey = leadKeySelector(lead);
        onLeadSave(leadKey);
    }

    handleRemoveClick = () => {
        const {
            onLeadRemove,
            lead,
        } = this.props;
        const leadKey = leadKeySelector(lead);
        onLeadRemove(leadKey);
    }

    handleExportClick = () => {
        const {
            onLeadExport,
            lead,
        } = this.props;
        const leadId = leadIdSelector(lead);
        onLeadExport(leadId);
    }

    render() {
        const {
            active,
            className,
            lead,
            leadState,
            progress,
        } = this.props;

        const type = leadSourceTypeSelector(lead);
        const { title } = leadFaramValuesSelector(lead);

        const stateIconClassName = _cs(
            styles.statusIcon,
            styleMap[leadState],
        );

        const exportShown = isDefined(leadIdSelector(lead));

        const exportDisabled = isLeadExportDisabled(leadState);
        const removeDisabled = isLeadRemoveDisabled(leadState);
        const saveDisabled = isLeadSaveDisabled(leadState);


        // TODO: STYLING loading doesn't rotate
        return (
            <Jumper
                active={active}
                className={styles.leadListItem}
            >
                <button
                    className={
                        _cs(
                            className,
                            styles.addLeadListItem,
                            active && styles.active,
                        )
                    }
                    onClick={this.handleClick}
                    type="button"
                >
                    <Icon
                        className={styles.icon}
                        name={leadTypeToIconClassMap[type]}
                    />
                    <span className={styles.title} >
                        { title }
                    </span>
                    <Icon
                        className={stateIconClassName}
                        name={iconMap[leadState]}
                    />
                </button>
                <div className={styles.buttonContainer}>
                    {exportShown && (
                        <Button
                            className={styles.button}
                            disabled={exportDisabled}
                            onClick={this.handleExportClick}
                            iconName="openLink"
                        />
                    )}
                    <Button
                        className={styles.button}
                        disabled={removeDisabled}
                        onClick={this.handleRemoveClick}
                        iconName="delete"
                    />
                    <PrimaryButton
                        className={styles.button}
                        disabled={saveDisabled}
                        onClick={this.handleSaveClick}
                        iconName="save"
                    />
                </div>
            </Jumper>
        );
    }
}
