import PropTypes from 'prop-types';
import React from 'react';
import { isTruthy } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import WarningButton from '#rsca/Button/WarningButton';

import {
    LEAD_TYPE,
    LEAD_STATUS,
    leadAccessor,
} from '#entities/lead';

import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    leadKey: PropTypes.string.isRequired,

    lead: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    leadState: PropTypes.string.isRequired,
    upload: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    onClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,

    active: PropTypes.bool,
    isRemoveDisabled: PropTypes.bool,
};

const defaultProps = {
    active: false,
    isRemoveDisabled: true,
    className: '',
    upload: undefined,
};

export default class LeadListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static leadTypeToIconClassMap = {
        [LEAD_TYPE.drive]: 'googleDrive',
        [LEAD_TYPE.dropbox]: 'dropbox',
        [LEAD_TYPE.file]: 'upload',
        [LEAD_TYPE.website]: 'globe',
        [LEAD_TYPE.text]: 'clipboard',
    };

    static styleMap = {
        [LEAD_STATUS.warning]: styles.warning,
        [LEAD_STATUS.requesting]: styles.pending,
        [LEAD_STATUS.uploading]: styles.pending,
        [LEAD_STATUS.invalid]: styles.error,
        [LEAD_STATUS.nonPristine]: styles.pristine,
        [LEAD_STATUS.complete]: styles.complete,
    };

    static iconMap = {
        [LEAD_STATUS.warning]: 'warning',
        [LEAD_STATUS.requesting]: 'loading',
        [LEAD_STATUS.uploading]: 'loading',
        [LEAD_STATUS.invalid]: 'error',
        [LEAD_STATUS.nonPristine]: 'codeWorking',
        [LEAD_STATUS.complete]: 'checkCircle',
    };

    // HANDLE

    handleClick = () => {
        this.props.onClick(this.props.leadKey);
    }

    handleRemoveClick = () => {
        this.props.onRemove(this.props.leadKey);
    }

    renderUploadProgress = ({ leadState, upload = {} }) => {
        const hide = leadState !== LEAD_STATUS.uploading || !upload;

        const progress = isTruthy(upload.progress) ? upload.progress : 0;

        const className = _cs(
            styles.progressBar,
            progress >= 100 && styles.completed,
            hide && styles.hide,
        );

        const style = { width: `${progress}%` };

        return (
            <span className={className}>
                <span
                    className={styles.progress}
                    style={style}
                />
            </span>
        );
    }

    render() {
        const {
            active,
            leadState,
            className,
            isRemoveDisabled,
            lead,
            upload,
        } = this.props;

        const type = leadAccessor.getType(lead);
        const { title } = leadAccessor.getFaramValues(lead);

        const UploadProgress = this.renderUploadProgress;

        const stateIconClassName = _cs(
            styles.statusIcon,
            LeadListItem.styleMap[leadState],
        );

        return (
            <div className={styles.leadListItem}>
                <button
                    className={`${styles.addLeadListItem} ${active ? styles.active : ''} ${className}`}
                    onClick={this.handleClick}
                    type="button"
                >
                    <Icon
                        className={styles.icon}
                        name={LeadListItem.leadTypeToIconClassMap[type]}
                    />
                    <span className={styles.title} >
                        { title }
                    </span>
                    <Icon
                        className={stateIconClassName}
                        name={LeadListItem.iconMap[leadState]}
                    />
                    <UploadProgress
                        leadState={leadState}
                        upload={upload}
                    />
                </button>
                <WarningButton
                    className={styles.removeButton}
                    disabled={isRemoveDisabled}
                    onClick={this.handleRemoveClick}
                    iconName="delete"
                />
            </div>
        );
    }
}
