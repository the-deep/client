import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rscg/FaramGroup';
import FaramList from '#rscg/FaramList';
import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import ColorInput from '#rsci/ColorInput';
import { randomString } from '#rsu/common';

import _ts from '#ts';
import { iconNames } from '#constants';

import LinkWidgetModal from '#widgetComponents/LinkWidgetModal';

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

    static keyExtractor = elem => elem.key;

    static addOptionClick = options => ([
        ...options,
        {
            key: randomString(16).toLowerCase(),
            value: '',
        },
    ])

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    constructor(props) {
        super(props);

        this.state = { showLinkModal: false };
    }

    handleAddFromWidgetClick = () => {
        this.setState({
            showLinkModal: true,
        }, () => this.props.onNestedModalChange(true));
    }

    handleLinkModalClose = () => {
        this.setState({
            showLinkModal: false,
        }, () => this.props.onNestedModalChange(false));
    }

    render() {
        const {
            index,
            className,
        } = this.props;

        const { showLinkModal } = this.state;

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
                        keySelector={RowContent.keyExtractor}
                    >
                        <NonFieldErrors
                            className={styles.error}
                            faramElement
                        />
                        <header className={styles.header}>
                            <h4>
                                {_ts('widgets.editor.matrix1d', 'cellsHeaderTitle')}
                            </h4>
                            <div>
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
            </div>
        );
    }
}
