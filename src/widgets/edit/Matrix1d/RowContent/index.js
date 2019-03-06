import PropTypes from 'prop-types';
import React from 'react';
import { FaramList, FaramGroup } from '@togglecorp/faram';

import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';
import ColorInput from '#rsci/ColorInput';
import { randomString } from '@togglecorp/fujs';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
};

export default class RowContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.key;
    static rowTitleSelector = d => d.value;

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

    static rowsModifier = rows => rows.map(r => ({
        key: randomString(16),
        value: r.label,
        originalWidget: r.originalWidget,
        originalKey: r.originalKey,
    }));

    render() {
        const {
            index,
            className,
        } = this.props;

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
                    </FaramList>
                    <header className={styles.header}>
                        <h4>
                            {_ts('widgets.editor.matrix1d', 'cellsHeaderTitle')}
                        </h4>
                        <div className={styles.buttonContainer} >
                            <h5>
                                {_ts('widgets.editor.matrix1d', 'addCellsFromTitle')}
                            </h5>
                            <GeoLink
                                faramElementName="cells"
                                titleSelector={RowContent.rowTitleSelector}
                                dataModifier={RowContent.rowsModifier}
                                lastItemTitle="cells"
                            />
                            <LinkWidgetModalButton
                                faramElementName="cells"
                                widgetKey={this.props.widgetKey}
                                titleSelector={RowContent.rowTitleSelector}
                                lastItemTitle="cells"
                                dataModifier={RowContent.rowsModifier}
                            />
                            <FaramList
                                faramElementName="cells"
                                keySelector={RowContent.keySelector}
                            >
                                <AccentButton
                                    faramElementName="add-btn"
                                    faramAction={RowContent.addOptionClick}
                                    iconName="clipboard"
                                    transparent
                                >
                                    {_ts('widgets.editor.matrix1d', 'addCellButtonTitle')}
                                </AccentButton>
                            </FaramList>
                        </div>
                    </header>
                    <FaramList
                        faramElementName="cells"
                        keySelector={RowContent.keySelector}
                    >
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
