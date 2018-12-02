import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import { FaramInputElement } from '#rscg/FaramElements';
import AccentButton from '#rsca/Button/AccentButton';
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
    lastItemTitle: PropTypes.string,
    onChange: PropTypes.func.isRequired, // eslint-disable-line
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    lastItemTitle: 'lastItem',
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
        this.setState({ showModal: true });
    }

    handleDuplicatesConfirmClose = () => {
        const { lastItemTitle } = this.props;
        const { newValue } = this.state;

        this.setState({
            showModal: false,
            showDuplicateConfirm: false,
        }, () => {
            this.props.onChange(newValue, { [lastItemTitle]: newValue[newValue.length - 1] });
        });
    }

    handleClose = () => {
        this.setState({ showModal: false });
    }

    handleSave = (newItems) => {
        const {
            dataModifier,
            titleSelector,
            value,
            onChange,
            lastItemTitle,
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
            });
        } else {
            this.setState({
                showModal: false,
            }, () => {
                onChange(finalRows, { [lastItemTitle]: finalRows[finalRows.length - 1] });
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
        const addFromWidgetsLabel = _ts('widgets.editor.link', 'addFromWidgets');
        const modalClassNames = [];
        if (showDuplicateConfirm) {
            modalClassNames.push(styles.disableModal);
        }

        return (
            <Fragment>
                <AccentButton
                    title={addFromWidgetsLabel}
                    tabIndex="-1"
                    transparent
                    iconName={iconNames.widget}
                    onClick={this.handleClick}
                >
                    {addFromWidgetsLabel}
                </AccentButton>
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
