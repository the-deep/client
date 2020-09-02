import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';

import {
    LEAD_TYPE,
    leadKeySelector,
    leadSourceTypeSelector,
} from '../../../utils';
import { LeadProcessorContext } from '../../../LeadProcessor';

import styles from './styles.scss';

const UploadProgress = ({ progress }) => {
    const hide = isNotDefined(progress) || progress === 100;

    const className = _cs(
        styles.progressBar,
        hide && styles.hide,
        progress === 100 && styles.completed,
    );

    const style = { width: `${progress || 0}%` };

    return (
        <span className={className}>
            <span
                className={styles.progress}
                style={style}
            />
        </span>
    );
};
UploadProgress.propTypes = {
    progress: PropTypes.number,
};
UploadProgress.defaultProps = {
    progress: undefined,
};

const leadTypeToIconClassMap = {
    [LEAD_TYPE.drive]: 'googleDrive',
    [LEAD_TYPE.dropbox]: 'dropbox',
    [LEAD_TYPE.file]: 'upload',
    [LEAD_TYPE.website]: 'globe',
    [LEAD_TYPE.text]: 'clipboard',
    [LEAD_TYPE.connectors]: 'link',
};

function ProcessingLead(props) {
    const {
        lead,
        title,
        progress,
    } = props;

    const { removeProcessingLead } = useContext(LeadProcessorContext);

    const type = leadSourceTypeSelector(lead);

    const handleLeadRemove = useCallback(() => {
        removeProcessingLead(leadKeySelector(lead));
    }, [removeProcessingLead, lead]);

    return (
        <div className={styles.processingLead}>
            <div className={styles.detailsContainer}>
                <Icon
                    className={styles.icon}
                    name={leadTypeToIconClassMap[type]}
                />
                <span className={styles.title}>
                    {title}
                </span>
            </div>
            <UploadProgress
                progress={progress}
            />
            <div className={styles.buttonContainer}>
                <Button
                    className={styles.button}
                    onClick={handleLeadRemove}
                    iconName="delete"
                />
            </div>
        </div>
    );
}

export default ProcessingLead;
