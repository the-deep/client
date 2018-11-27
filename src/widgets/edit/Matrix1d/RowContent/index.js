import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rscg/FaramGroup';
import FaramList from '#rscg/FaramList';
import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import ColorInput from '#rsci/ColorInput';
import {
    findDuplicates,
    listToMap,
    randomString,
} from '#rsu/common';
import Confirm from '#rscv/Modal/Confirm';

import _ts from '#ts';
import { iconNames } from '#constants';

import LinkWidgetModal from '#widgetComponents/LinkWidgetModal';
import GeoLink from '#widgetComponents/GeoLink';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
    widgetKey: PropTypes.string.isRequired,
    onNestedModalChange: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

export default class RowContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.key;

    static addOptionClick = options => ([
        ...options,
        {
            key: randomString(16),
            value: '',
        },
    ])

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    constructor(props) {
        super(props);

        this.state = {
            showLinkModal: false,
            duplicateItems: [],
            showDuplicateConfirm: false,
        };
    }

    handleAddFromWidgetClick = () => {
        this.setState({
            showLinkModal: true,
        }, () => this.props.onNestedModalChange(true));
    }

    handleDuplicatesConfirmClose = () => {
        this.setState({
            showDuplicateConfirm: false,
        }, () => this.props.onNestedModalChange(false));
    }

    handleLinkModalClose = () => {
        this.setState({
            showLinkModal: false,
        }, () => this.props.onNestedModalChange(false));
    }

    addFromWidgetClick = (items, _, newItems) => {
        const newListOfItems = newItems.map(r => ({
            key: randomString(16),
            value: r.label,
            originalWidget: r.originalWidget,
            originalKey: r.originalKey,
        }));

        let finalRows = [...items, ...newListOfItems];
        const duplicates = findDuplicates(finalRows, d => d.value);

        if (duplicates.length > 0) {
            this.setState({
                showLinkModal: false,
                showDuplicateConfirm: true,
                duplicateItems: duplicates,
            }, () => this.props.onNestedModalChange(true));

            const duplicatesMap = listToMap(
                duplicates,
                d => d,
            );
            const newRowsWithoutDuplicates = newListOfItems
                .filter(row => !duplicatesMap[row.value]);

            finalRows = [...items, ...newRowsWithoutDuplicates];
        } else {
            this.setState({
                showLinkModal: false,
            }, () => this.props.onNestedModalChange(false));
        }

        return finalRows;
    };

    render() {
        const {
            index,
            className,
        } = this.props;

        const {
            duplicateItems,
            showDuplicateConfirm,
            showLinkModal,
        } = this.state;

        return (
            <div className={className}>
                <FaramGroup faramElementName={String(index)}>
                    <NonFieldErrors
                        className={styles.error}
                        faramElement
                    />
                    <div className={styles.editRow}>
                        <ColorInput
                            // className={styles.input}
                            faramElementName="color"
                            label="Color"
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="title"
                            label={_ts('widgets.editor.matrix1d', 'unnamedRowTitle', { index: index + 1 })}
                            autoFocus
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="tooltip"
                            label={_ts('widgets.editor.matrix1d', 'tooltipLabel')}
                        />
                    </div>
                    <FaramList
                        faramElementName="cells"
                        keySelector={RowContent.keySelector}
                    >
                        <NonFieldErrors
                            className={styles.error}
                            faramElement
                        />
                        <header className={styles.header}>
                            <h4>
                                {_ts('widgets.editor.matrix1d', 'cellsHeaderTitle')}
                            </h4>
                            <div className={styles.buttonContainer} >
                                <GeoLink
                                    faramElementName="add-from-geo-btn"
                                    faramAction={this.addFromWidgetClick}
                                />
                                <PrimaryButton
                                    transparent
                                    iconName={iconNames.add}
                                    onClick={this.handleAddFromWidgetClick}
                                >
                                    {_ts('widgets.editor.matrix1d', 'addFromWidgets')}
                                </PrimaryButton>
                                {showLinkModal &&
                                    <LinkWidgetModal
                                        onClose={this.handleLinkModalClose}
                                        widgetKey={this.props.widgetKey}
                                        faramElementName="add-from-widget-btn"
                                        faramAction={this.addFromWidgetClick}
                                    />
                                }
                                <PrimaryButton
                                    faramElementName="add-btn"
                                    faramAction={RowContent.addOptionClick}
                                    iconName={iconNames.add}
                                    transparent
                                >
                                    {_ts('widgets.editor.matrix1d', 'addCellButtonTitle')}
                                </PrimaryButton>
                            </div>
                        </header>
                        <SortableListView
                            faramElement
                            className={styles.cellList}
                            dragHandleClassName={styles.dragHandle}
                            itemClassName={styles.item}
                            rendererParams={RowContent.rendererParams}
                            renderer={InputRow}
                        />
                    </FaramList>
                </FaramGroup>
                <Confirm
                    show={showDuplicateConfirm}
                    hideCancel
                    title={_ts('widgets.editor.matrix1d', 'duplicatesConfirmTitle')}
                    onClose={this.handleDuplicatesConfirmClose}
                >
                    {duplicateItems.length > 1 ? (
                        _ts(
                            'widgets.editor.matrix1d',
                            'duplicatesConfirmText',
                            {
                                duplicates: (
                                    <span className={styles.duplicateItems}>
                                        {duplicateItems.join(', ')}
                                    </span>
                                ),
                            },
                        )
                    ) : (
                        _ts(
                            'widgets.editor.matrix1d',
                            'duplicateConfirmText',
                            {
                                duplicate: (
                                    <span className={styles.duplicateItems}>
                                        {duplicateItems[0]}
                                    </span>
                                ),
                            },
                        )
                    )}
                </Confirm>
            </div>
        );
    }
}
