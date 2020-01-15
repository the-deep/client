import PropTypes from 'prop-types';
import React from 'react';
import {
    _cs,
    compareString,
    compareNumber,
} from '@togglecorp/fujs';

import Table from '#rscv/Table';
import ColorInput from '#rsci/ColorInput';
import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';
import notify from '#notify';

import Actions from './EntryLabelsActions';
import EntryLabelEditForm from './EntryLabelEditForm';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const requestOptions = {
    projectEntriesLabels: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/entry-labels/`,
        method: methods.GET,
        query: ({
            fields: [
                'id',
                'project',
                'created_by_name',
                'title',
                'order',
                'color',
                'entry_count',
            ],
        }),
        onMount: true,
        onSuccess: ({
            params: { setEntryLabels },
            response: {
                results = [],
            } = {},
        }) => {
            if (setEntryLabels) {
                setEntryLabels(results);
            }
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('project.entryGroups', 'entryLabelsTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project.entryGroups', 'entryLabelsTitle'),
                type: notify.type.ERROR,
                message: _ts('project.entryGroups', 'entryLabelsFatal'),
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'entryLabelsList',
        },
    },
};

const entryLabelKeySelector = d => d.id;

@RequestCoordinator
@RequestClient(requestOptions)
export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            requests: { projectEntriesLabels },
        } = this.props;

        projectEntriesLabels.setDefaultParams({
            setEntryLabels: this.setEntryLabels,
        });

        this.state = {
            entryLabels: [],
        };

        this.headers = [
            {
                key: 'color',
                label: _ts('project.entryGroups', 'colorHeaderTitle'),
                order: 1,
                modifier: d => (
                    <ColorInput
                        value={d.color}
                        readOnly
                        showHintAndError={false}
                        showLabel={false}
                    />
                ),
            },
            {
                key: 'title',
                label: _ts('project.entryGroups', 'titleHeaderTitle'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdByName',
                label: _ts('project.entryGroups', 'createdByHeaderTitle'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.createdByName, b.createdByName),
            },
            {
                key: 'entryCount',
                label: _ts('project.entryGroups', 'entriesCountHeaderTitle'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareNumber(a.entryCount, b.entryCount),
            },
            {
                key: 'actions',
                label: _ts('project.entryGroups', 'actionsHeaderTitle'),
                order: 5,
                modifier: d => (
                    <Actions
                        entryLabel={d}
                        entryLabelId={d.id}
                        projectId={this.props.projectId}
                        onEntryLabelDelete={this.handleEntryLabelDelete}
                        onEntryLabelEdit={this.handleEntryLabelEdit}
                    />
                ),
            },
        ];
    }

    setEntryLabels = (entryLabels) => {
        this.setState({ entryLabels });
    };

    handleEntryLabelDelete = (entryLabelId) => {
        const { entryLabels } = this.state;
        const newEntryLabels = [...entryLabels];
        const selectedEntryLabelIndex = entryLabels.findIndex(e => e.id === entryLabelId);

        if (selectedEntryLabelIndex === -1) {
            return;
        }
        newEntryLabels.splice(selectedEntryLabelIndex, 1);

        this.setState({ entryLabels: newEntryLabels });
    }

    handleEntryLabelAdd = (response) => {
        const { entryLabels } = this.state;

        const newEntryLabels = [
            ...entryLabels,
            response,
        ];

        this.setState({ entryLabels: newEntryLabels });
    }

    handleEntryLabelEdit = (entryLabelId, entryLabel) => {
        const { entryLabels } = this.state;
        const newEntryLabels = [...entryLabels];
        const selectedEntryLabelIndex = entryLabels.findIndex(e => e.id === entryLabelId);

        if (selectedEntryLabelIndex === -1) {
            return;
        }
        newEntryLabels.splice(selectedEntryLabelIndex, 1);
        newEntryLabels.push(entryLabel);

        this.setState({ entryLabels: newEntryLabels });
    }

    render() {
        const {
            className,
            requests: {
                projectEntriesLabels: {
                    pending,
                },
            },
            projectId,
        } = this.props;
        const { entryLabels } = this.state;

        return (
            <div className={_cs(className, styles.entryConfig)}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        {_ts('project.entryGroups', 'entryLabelsHeader')}
                    </h3>
                    <ModalButton
                        iconName="add"
                        modal={(
                            <EntryLabelEditForm
                                onEntryLabelAdd={this.handleEntryLabelAdd}
                                projectId={projectId}
                                isAddForm
                            />
                        )}
                    >
                        {_ts('project.entryGroups', 'addButtonTitle')}
                    </ModalButton>
                </header>
                <div className={styles.container}>
                    <Table
                        className={styles.table}
                        pending={pending}
                        headers={this.headers}
                        data={entryLabels}
                        keySelector={entryLabelKeySelector}
                    />
                </div>
            </div>
        );
    }
}
