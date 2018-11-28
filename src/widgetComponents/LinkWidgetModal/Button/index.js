import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { FaramInputElement } from '#rscg/FaramElements';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Confirm from '#rscv/Modal/Confirm';
import {
    findDuplicates,
    listToMap,
} from '#rsu/common';
import { iconNames } from '#constants';

import _ts from '#ts';
import styles from './styles.scss';

import LinkWidgetModal from '../../LinkWidgetModal';

const propTypes = {
    value: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    dataModifier: PropTypes.func.isRequired,
    titleSelector: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, // eslint-disable-line
    onModalVisibilityChange: PropTypes.func,
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    onModalVisibilityChange: () => {},
};

@FaramInputElement
export default class LinkWidgetModalButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            showDuplicateConfirm: false,
            duplicateItems: [],
            nonDuplicateItems: [],
        };
    }

    handleClick = () => {
        this.setState({
            showModal: true,
        }, () => this.props.onModalVisibilityChange(true));
    }

    handleDuplicatesConfirmClose = () => {
        const { newValue } = this.state;

        this.setState({
            showModal: false,
            showDuplicateConfirm: false,
        }, () => {
            this.props.onChange(newValue, { lastItem: newValue[newValue.length - 1] });
            this.props.onModalVisibilityChange(false);
        });
    }

    handleClose = () => {
        this.setState({
            showModal: false,
        }, () => this.props.onModalVisibilityChange(false));
    }

    handleSave = (newItems) => {
        const {
            dataModifier,
            titleSelector,
            value,
        } = this.props;

        const itemsMap = dataModifier(newItems);
        let finalRows = [...value, ...itemsMap];

        const duplicates = findDuplicates(finalRows, titleSelector);
        if (duplicates.length > 0) {
            const duplicatesMap = listToMap(
                duplicates,
                d => d,
            );
            const newRowsWithoutDuplicates = itemsMap.filter(row =>
                !duplicatesMap[titleSelector(row)]);
            finalRows = [...value, ...newRowsWithoutDuplicates];
            this.setState({
                showDuplicateConfirm: true,
                duplicateItems: duplicates,
                nonDuplicateItems: newRowsWithoutDuplicates.map(u => titleSelector(u)),
                newValue: finalRows,
            }, () => {
                this.props.onModalVisibilityChange(true);
            });
        } else {
            this.setState({
                showModal: false,
            }, () => {
                this.props.onChange(finalRows, { lastItem: finalRows[finalRows.length - 1] });
                this.props.onModalVisibilityChange(false);
            });
        }
    }

    render() {
        const {
            showModal,
            duplicateItems,
            nonDuplicateItems,
            showDuplicateConfirm,
        } = this.state;
        const editConditionsLabel = _ts('widgets.editor.link', 'addFromWidgets');
        const modalClassNames = [];
        if (showDuplicateConfirm) {
            modalClassNames.push(styles.disableModal);
        }

        return (
            <Fragment>
                <PrimaryButton
                    title={editConditionsLabel}
                    tabIndex="-1"
                    transparent
                    iconName={iconNames.add}
                    onClick={this.handleClick}
                >
                    {editConditionsLabel}
                </PrimaryButton>
                {
                    showModal && (
                        <LinkWidgetModal
                            className={modalClassNames.join(' ')}
                            onClose={this.handleClose}
                            onClick={this.handleSave}
                            widgetKey={this.props.widgetKey}
                        />
                    )
                }
                <Confirm
                    show={showDuplicateConfirm}
                    hideCancel
                    closeOnEscape={false}
                    closeOnOutsideClick={false}
                    title={_ts('widgets.editor.link', 'duplicatesConfirmTitle')}
                    onClose={this.handleDuplicatesConfirmClose}
                >
                    {nonDuplicateItems.length > 0 ? (
                        <React.Fragment>
                            {_ts(
                                'widgets.editor.link',
                                'duplicatesConfirmText',
                                {
                                    duplicates: (
                                        <span className={styles.duplicateItems}>
                                            {duplicateItems.join(', ')}
                                        </span>
                                    ),
                                },
                            )}
                            <div className={styles.nonDuplicates} >
                                {_ts(
                                    'widgets.editor.link',
                                    'nonDuplicatesConfirmText',
                                    {
                                        nonDuplicates: (
                                            <span className={styles.duplicateItems}>
                                                {nonDuplicateItems.join(', ')}
                                            </span>
                                        ),
                                    },
                                )}
                            </div>
                        </React.Fragment>
                    ) : (
                        _ts(
                            'widgets.editor.link',
                            'duplicatesConfirmText',
                            {
                                duplicates: (
                                    <span className={styles.duplicateItems}>
                                        {duplicateItems.join(', ')}
                                    </span>
                                ),
                            },
                        )
                    )}
                </Confirm>
            </Fragment>
        );
    }
}
