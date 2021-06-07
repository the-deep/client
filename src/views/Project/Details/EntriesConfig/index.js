import PropTypes from 'prop-types';
import React from 'react';
import produce from 'immer';
import {
    _cs,
    compareNumber,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Icon from '#rscg/Icon';
import SortableListView from '#rscv/SortableListView';
import modalize from '#rscg/Modalize';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';
import notify from '#notify';

import EntryLabelEditForm from './EntryLabelEditForm';
import EntryLabelCard from './EntryLabelCard';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    projectId: undefined,
    readOnly: false,
};

const getOrderedEntryLabel = (entryLabels) => {
    if (!entryLabels || entryLabels.length <= 1) {
        return entryLabels;
    }
    return [...entryLabels].sort((a, b) => compareNumber(a.order, b.order));
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
                'created_by',
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
                const ordererEntryLabels = getOrderedEntryLabel(results);
                setEntryLabels(ordererEntryLabels);
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
    entryLabelsOrderUpdate: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/entry-labels/bulk-update-order/`,
        query: ({
            fields: [
                'id',
                'order',
                'title',
                'project',
            ],
        }),
        method: methods.POST,
        body: ({ params: { body } }) => body,
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
            schemaName: 'array.entryLabelOrder',
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
            disableHover: false,
            entryLabels: [],
        };
    }

    setEntryLabels = (entryLabels) => {
        this.setState({ entryLabels });
    };

    entryLabelRendererParams = (key, data) => {
        const {
            projectId,
            readOnly,
        } = this.props;
        const { disableHover } = this.state;

        return ({
            className: styles.card,
            projectId,
            entryLabel: data,
            onEntryLabelDelete: this.handleEntryLabelDelete,
            onEntryLabelEdit: this.handleEntryLabelEdit,
            readOnly,
            disableHover,
        });
    }

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

    handleEntryLabelOrderChange = (entryLabels) => {
        this.setState({ disableHover: false });

        if (entryLabels === this.state.entryLabels) {
            return;
        }

        const {
            requests: {
                entryLabelsOrderUpdate,
            },
        } = this.props;

        const entryLabelsOrderMap = entryLabels.map((label, index) => ({
            id: label.id,
            order: index + 1,
        }));

        this.setState({ entryLabels }, () => {
            entryLabelsOrderUpdate.do({
                body: entryLabelsOrderMap,
            });
        });
    }

    handleEntryLabelEdit = (entryLabelId, entryLabel) => {
        const { entryLabels } = this.state;
        const newEntryLabels = produce(entryLabels, (safeLabels) => {
            const selectedEntryLabelIndex = safeLabels.findIndex(e => e.id === entryLabelId);
            if (selectedEntryLabelIndex === -1) {
                return;
            }
            // eslint-disable-next-line no-param-reassign
            safeLabels[selectedEntryLabelIndex] = entryLabel;
        });

        this.setState({ entryLabels: newEntryLabels });
    }

    handleSortStart = () => {
        this.setState({ disableHover: true });
    }

    renderDragHandle = () => (
        <Icon
            className={styles.dragHandle}
            name="hamburger"
        />
    );

    render() {
        const {
            className,
            requests: {
                projectEntriesLabels: {
                    pending,
                },
                entryLabelsOrderUpdate: {
                    pending: entryLabelsPending,
                },
            },
            projectId,
            readOnly,
        } = this.props;

        const {
            entryLabels,
            disableHover,
        } = this.state;

        return (
            <div className={_cs(className, styles.entryConfig)}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        {_ts('project.entryGroups', 'entryLabelsHeader')}
                    </h3>
                    <ModalButton
                        iconName="add"
                        disabled={readOnly}
                        modal={(
                            <EntryLabelEditForm
                                onEntryLabelAdd={this.handleEntryLabelAdd}
                                projectId={projectId}
                                isAddForm
                                newOrder={entryLabels.length + 1}
                            />
                        )}
                    >
                        {_ts('project.entryGroups', 'addButtonTitle')}
                    </ModalButton>
                </header>
                <div className={styles.container}>
                    {entryLabelsPending && <LoadingAnimation />}
                    <SortableListView
                        className={styles.cards}
                        data={entryLabels}
                        onChange={this.handleEntryLabelOrderChange}
                        keySelector={entryLabelKeySelector}
                        renderer={EntryLabelCard}
                        rendererParams={this.entryLabelRendererParams}
                        pending={pending}
                        disabled={readOnly}
                        dragHandleModifier={this.renderDragHandle}
                        itemClassName={_cs(
                            styles.cardContainer,
                            // eslint-disable-next-line css-modules/no-undef-class
                            disableHover && styles.disableHover,
                        )}
                        onSortStart={this.handleSortStart}
                        axis="xy"
                        lockAxis=""
                    />
                </div>
            </div>
        );
    }
}
