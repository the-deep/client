import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import React from 'react';
import { connect } from 'react-redux';

import FloatingContainer from '#rscv/FloatingContainer';
import List from '#rscv/List';
import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';
import { entryGroupAccessor } from '#entities/editEntries';
import {
    editEntriesLabelsSelector,
    editEntriesFilteredEntryGroupsSelector,

    editEntriesAddEntryGroupAction,
} from '#redux';
import EntryGroupEditModal from '#components/general/EntryGroupEditModal';
import _ts from '#ts';

import LabelHeader from './LabelHeader';
import GroupRow from './GroupRow';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    closeModal: PropTypes.func,
    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.number,
    selectedEntryKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    selectedEntryServerId: PropTypes.number,
    addEntryGroup: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    closeModal: undefined,
    leadId: undefined,
    entryGroups: [],
    labels: [],
    selectedEntryKey: undefined,
    selectedEntryServerId: undefined,
};

const mapStateToProps = state => ({
    entryGroups: editEntriesFilteredEntryGroupsSelector(state),
    labels: editEntriesLabelsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addEntryGroup: params => dispatch(editEntriesAddEntryGroupAction(params)),
});

const WINDOW_PADDING = 24;
const labelKeySelector = d => d.id;

@connect(mapStateToProps, mapDispatchToProps)
export default class EntryCommentModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleInvalidate = (container) => {
        const {
            // eslint-disable-next-line react/prop-types
            parentBCR: {
                // eslint-disable-next-line react/prop-types
                top: parentBCRTop,
                // eslint-disable-next-line react/prop-types
                left: parentBCRLeft,
            },
        } = this.props;

        const contentRect = container.getBoundingClientRect();

        const windowRect = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        let topCalc = parentBCRTop;
        let leftCalc = parentBCRLeft - contentRect.width;

        if (leftCalc < 0) {
            leftCalc = WINDOW_PADDING;
        }

        if ((topCalc + contentRect.height) > (windowRect.height - WINDOW_PADDING)) {
            topCalc -= ((contentRect.height + topCalc + WINDOW_PADDING) - windowRect.height);
        }

        const optionsContainerPosition = {
            top: `${topCalc}px`,
            left: `${leftCalc}px`,
        };

        return optionsContainerPosition;
    }

    handleModalClose = () => {
        const { closeModal } = this.props;
        if (isDefined(closeModal)) {
            closeModal();
        }
    }

    handleEntryGroupCreate = (values) => {
        const {
            leadId,
            addEntryGroup,
        } = this.props;

        addEntryGroup({
            leadId,
            entryGroup: {
                ...values,
                selections: [],
            },
        });
    }

    labelsHeaderRendererParams = (key, data) => {
        const {
            title,
            color,
        } = data;

        return ({
            label: title,
            color,
        });
    }

    groupRendererParams = (key, data) => {
        const {
            labels,
            leadId,
            selectedEntryKey,
            selectedEntryServerId,
        } = this.props;

        const {
            data: {
                title,
                selections,
            },
        } = data;

        return ({
            leadId,
            title,
            labels,
            selections,
            groupKey: key,
            selectedEntryKey,
            selectedEntryServerId,
        });
    }

    render() {
        const {
            className,
            entryGroups,
            labels,
            closeModal,
        } = this.props;

        return (
            <FloatingContainer
                className={_cs(className, styles.container)}
                onInvalidate={this.handleInvalidate}
                onClose={this.handleModalClose}
                focusTrap
                closeOnEscape
                showHaze
            >
                <header className={styles.header} >
                    <h4 className={styles.heading} >
                        {_ts('editEntry.groupModal', 'addToEntryGroup')}
                    </h4>
                    <Button
                        className={styles.button}
                        transparent
                        iconName="close"
                        onClick={closeModal}
                    />
                </header>
                <div className={styles.content}>
                    <table
                        cellSpacing={5}
                    >
                        <thead>
                            <tr>
                                <th />
                                <List
                                    data={labels}
                                    rendererParams={this.labelsHeaderRendererParams}
                                    renderer={LabelHeader}
                                    keySelector={labelKeySelector}
                                />
                            </tr>
                        </thead>
                        <tbody>
                            <List
                                data={entryGroups}
                                rendererParams={this.groupRendererParams}
                                renderer={GroupRow}
                                keySelector={entryGroupAccessor.key}
                            />
                        </tbody>
                    </table>
                    <ModalButton
                        transparent
                        iconName="add"
                        modal={
                            <EntryGroupEditModal
                                className={styles.addEntryGroupModal}
                                onSave={this.handleEntryGroupCreate}
                                isCreate
                            />
                        }
                    >
                        {_ts('editEntry.groupModal', 'createEntryGroupTitle')}
                    </ModalButton>
                </div>
            </FloatingContainer>
        );
    }
}
