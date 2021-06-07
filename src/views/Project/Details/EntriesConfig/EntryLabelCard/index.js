import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import { pathNames } from '#constants';
import _ts from '#ts';

import ActionButtons from '../EntryLabelsActions';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number,

    entryLabel: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onEntryLabelDelete: PropTypes.func.isRequired,
    onEntryLabelEdit: PropTypes.func.isRequired,
    readOnly: PropTypes.bool.isRequired,
    disableHover: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: undefined,
    projectId: undefined,
};

export default class EntryLabelCard extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            entryLabel,
            projectId,
            onEntryLabelDelete,
            onEntryLabelEdit,
            readOnly,
            disableHover,
        } = this.props;

        const {
            id: entryLabelId,
            title,
            color,
            createdByName,
            createdBy,
            entryCount,
        } = entryLabel;

        return (
            <div
                className={_cs(
                    className,
                    styles.labelCard,
                    readOnly && styles.readOnly,
                    // eslint-disable-next-line css-modules/no-undef-class
                    disableHover && styles.disableHover,
                )}
            >
                <header className={styles.header}>
                    <h4
                        className={styles.heading}
                        style={{ color }}
                    >
                        <span
                            className={styles.circle}
                            style={{ backgroundColor: color }}
                        />
                        {title}
                    </h4>
                    {!readOnly && (
                        <ActionButtons
                            className={styles.actionButtons}
                            entryLabel={entryLabel}
                            entryLabelId={entryLabelId}
                            projectId={projectId}
                            onEntryLabelDelete={onEntryLabelDelete}
                            onEntryLabelEdit={onEntryLabelEdit}
                        />
                    )}
                </header>
                <footer className={styles.footer}>
                    <div className={_cs(styles.createdBy, styles.labelValue)}>
                        <div className={styles.label}>
                            {_ts('project.entryGroups', 'createdByTitle')}
                        </div>
                        <div>
                            <Link
                                key={createdBy}
                                className={styles.createdByLink}
                                to={reverseRoute(pathNames.userProfile, { userId: createdBy })}
                            >
                                {createdByName}
                            </Link>
                        </div>
                    </div>
                    <div className={_cs(styles.entryCount, styles.labelValue)}>
                        <div className={styles.label}>
                            {_ts('project.entryGroups', 'entriesCountCardHeaderTitle')}
                        </div>
                        <div>
                            {entryCount || 0}
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}
