import PropTypes from 'prop-types';
import React from 'react';
import { FaramList, FaramGroup } from '@togglecorp/faram';
import { randomString } from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';
import ColorInput from '#rsci/ColorInput';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SubdimensionRow from './SubdimensionRow';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
};

export default class DimensionContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.id;
    static rowTitleSelector = d => d.title;

    static addSubdimensionClick = subdimensions => ([
        ...subdimensions,
        {
            id: randomString(16),
            title: '',
            tooltip: '',
        },
    ])

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    static rowsModifier = rows => rows.map(r => ({
        id: randomString(16),
        title: r.label,
        originalWidget: r.originalWidget,
        originalKey: r.originalKey,
        tooltip: '',
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
                    <div className={styles.editDimension}>
                        <ColorInput
                            // className={styles.input}
                            faramElementName="color"
                            label={_ts('widgets.editor.matrix2d', 'colorLabel')}
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="title"
                            label={_ts('widgets.editor.matrix2d', 'unnamedDimensionLabel', { index: index + 1 })}
                            autoFocus
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="tooltip"
                            label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
                        />
                    </div>
                    <FaramList
                        faramElementName="subdimensions"
                        keySelector={DimensionContent.keySelector}
                    >
                        <NonFieldErrors
                            className={styles.error}
                            faramElement
                        />
                    </FaramList>
                    <header className={styles.header}>
                        <h4>
                            {_ts('widgets.editor.matrix2d', 'subdimensionsHeaderTitle')}
                        </h4>
                        <div className={styles.buttonContainer} >
                            <h5>
                                {_ts('widgets.editor.matrix2d', 'addSubDimensionsTitle')}
                            </h5>
                            <GeoLink
                                faramElementName="subdimensions"
                                titleSelector={DimensionContent.rowTitleSelector}
                                dataModifier={DimensionContent.rowsModifier}
                                lastItemTitle="subdimensions"
                            />
                            <LinkWidgetModalButton
                                faramElementName="subdimensions"
                                widgetKey={this.props.widgetKey}
                                titleSelector={DimensionContent.rowTitleSelector}
                                dataModifier={DimensionContent.rowsModifier}
                                lastItemTitle="subdimensions"
                            />
                            <FaramList
                                faramElementName="subdimensions"
                                keySelector={DimensionContent.keySelector}
                            >
                                <AccentButton
                                    faramElementName="add-btn"
                                    faramAction={DimensionContent.addSubdimensionClick}
                                    iconName="add"
                                    transparent
                                >
                                    {_ts('widgets.editor.matrix2d', 'addSubdimensionButtonTitle')}
                                </AccentButton>
                            </FaramList>
                        </div>
                    </header>
                    <FaramList
                        faramElementName="subdimensions"
                        keySelector={DimensionContent.keySelector}
                    >
                        <SortableListView
                            faramElement
                            className={styles.cellList}
                            dragHandleClassName={styles.dragHandle}
                            itemClassName={styles.item}
                            rendererParams={DimensionContent.rendererParams}
                            renderer={SubdimensionRow}
                        />
                    </FaramList>
                </FaramGroup>
            </div>
        );
    }
}
