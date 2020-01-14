import PropTypes from 'prop-types';
import React from 'react';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';

import _ts from '#ts';

import EntryLabelEditForm from '../EntryLabelEditForm';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number,

    entryLabel: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/forbid-prop-types
    entryLabelId: PropTypes.number.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    onEntryLabelDelete: PropTypes.func.isRequired,
    onEntryLabelEdit: PropTypes.func.isRequired,
};

const defaultProps = {
    projectId: undefined,
};

const requestOptions = {
    entryLabelDelete: {
        url: ({
            props: {
                projectId,
                entryLabelId,
            },
        }) => `/projects/${projectId}/entry-labels/${entryLabelId}/`,
        method: methods.DELETE,
        onSuccess: ({
            props: {
                onEntryLabelDelete,
                entryLabelId,
            },
        }) => {
            if (onEntryLabelDelete) {
                onEntryLabelDelete(entryLabelId);
            }
        },
    },
};

@RequestCoordinator
@RequestClient(requestOptions)
export default class EntryLabelsActions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleEntryLabelDelete = () => {
        const {
            requests: {
                entryLabelDelete,
            },
        } = this.props;

        entryLabelDelete.do();
    }

    render() {
        const {
            projectId,
            entryLabel,
            entryLabelId,
            onEntryLabelEdit,
            requests: {
                entryLabelDelete: {
                    pending,
                },
            },
        } = this.props;

        return (
            <div className={styles.actions}>
                <DangerConfirmButton
                    className={styles.button}
                    title={_ts('project.entryGroups', 'deleteEntryLabelButtonTitle')}
                    onClick={this.handleEntryLabelDelete}
                    smallVerticalPadding
                    transparent
                    iconName="delete"
                    confirmationMessage={_ts('project.entryGroups', 'deleteEntryLabelConfirmation')}
                />
                <ModalButton
                    className={styles.button}
                    iconName="edit"
                    transparent
                    pending={pending}
                    modal={(
                        <EntryLabelEditForm
                            entryLabelId={entryLabelId}
                            entryLabel={entryLabel}
                            onEntryLabelEdit={onEntryLabelEdit}
                            projectId={projectId}
                        />
                    )}
                />
            </div>
        );
    }
}
