import PropTypes from 'prop-types';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import React from 'react';
import { connect } from 'react-redux';

import FloatingContainer from '#rscv/FloatingContainer';
import List from '#rscv/List';
import { entryGroupAccessor } from '#entities/editEntries';
import {
    editEntriesLabelsSelector,
    editEntriesFilteredEntryGroupsSelector,
} from '#redux';

import LabelHeader from './LabelHeader';
import GroupRow from './GroupRow';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    closeModal: PropTypes.func,
    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

const defaultProps = {
    className: undefined,
    closeModal: undefined,
    entryGroups: [],
    labels: [],
    selectedEntryKey: undefined,
};

const mapStateToProps = state => ({
    entryGroups: editEntriesFilteredEntryGroupsSelector(state),
    labels: editEntriesLabelsSelector(state),
});

const WINDOW_PADDING = 24;
const labelKeySelector = d => d.id;

@connect(mapStateToProps)
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

    labelsHeaderRendererParams = (key, data) => {
        const { title } = data;

        return ({
            label: title,
        });
    }

    groupRendererParams = (key, data) => {
        const {
            labels,
            selectedEntryKey,
        } = this.props;

        const {
            data: {
                title,
                selections,
            },
        } = data;

        return ({
            title,
            labels,
            selections,
            selectedEntryKey,
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
                onBlur={closeModal}
                showHaze
            >
                <header>
                    header
                </header>
                <div className={styles.content}>
                    <table>
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
                </div>
            </FloatingContainer>
        );
    }
}
