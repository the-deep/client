import PropTypes from 'prop-types';
import React from 'react';
import {
    FaramList,
    FaramGroup,
} from '@togglecorp/faram';
import {
    randomString,
    _cs,
} from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import AccentButton from '#rsca/Button/AccentButton';
import Button from '#rsca/Button';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import ColorInput from '#rsci/ColorInput';

import _ts from '#ts';

import OrientationInput from '#components/general/OrientationInput';
import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SubdimensionRow from './SubdimensionRow';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
    widgetKey: PropTypes.string.isRequired,
    onBackButtonClick: PropTypes.func.isRequired,
    advanceMode: PropTypes.bool,
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    advanceMode: false,
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

    static rowsModifier = rows => rows.map(r => ({
        id: randomString(16),
        title: r.label,
        originalWidget: r.originalWidget,
        originalKey: r.originalKey,
        tooltip: '',
    }));

    rendererParams = (key, elem, i) => ({
        index: i,
        className: styles.subDimensionContent,
        advanceMode: this.props.advanceMode,
    })

    render() {
        const {
            index,
            className,
            onBackButtonClick,
            advanceMode,
            title,
        } = this.props;

        return (
            <div className={_cs(styles.dimensionContent, className)}>
                <FaramGroup faramElementName={String(index)}>
                    <header className={styles.header}>
                        <Button
                            transparent
                            onClick={onBackButtonClick}
                            className={styles.backButton}
                            iconName="back"
                        />
                        <h2 className={styles.title}>
                            {title}
                        </h2>
                    </header>
                    <NonFieldErrors
                        className={styles.nonFieldErrors}
                        faramElement
                        persistent={false}
                    />
                    <div className={styles.editDimension}>
                        <div className={styles.top}>
                            <ColorInput
                                className={styles.colorInput}
                                faramElementName="color"
                                label={_ts('widgets.editor.matrix2d', 'colorLabel')}
                                showSwatches
                            />
                            <TextInput
                                className={styles.titleInput}
                                faramElementName="title"
                                label={_ts('widgets.editor.matrix2d', 'unnamedDimensionLabel', { index: index + 1 })}
                                autoFocus
                            />
                            { advanceMode && (
                                <>
                                    <OrientationInput
                                        className={styles.orientationInput}
                                        faramElementName="orientation"
                                    />
                                    <TextInput
                                        type="number"
                                        label={_ts('widgets.editor.matrix2d', 'fontSizeInputLabel')}
                                        className={styles.fontSizeInput}
                                        faramElementName="fontSize"
                                        placeholder={_ts('widgets.editor.matrix2d', 'fontSizeInputPlaceholder')}
                                    />
                                    <TextInput
                                        type="number"
                                        label={_ts('widgets.editor.matrix2d', 'heightInputLabel')}
                                        className={styles.heightInput}
                                        faramElementName="height"
                                        placeholder={_ts('widgets.editor.matrix2d', 'heightInputPlaceholder')}
                                    />
                                </>
                            )}
                        </div>
                        <div className={styles.bottom}>
                            <TextArea
                                faramElementName="tooltip"
                                label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
                            />
                        </div>
                    </div>
                    <FaramList
                        faramElementName="subdimensions"
                        keySelector={DimensionContent.keySelector}
                    >
                        <NonFieldErrors
                            className={styles.nonFieldErrors}
                            faramElement
                            persistent={false}
                        />
                    </FaramList>
                    <div className={styles.subDimensionListContainer}>
                        <header className={styles.header}>
                            <h4 className={styles.heading}>
                                {_ts('widgets.editor.matrix2d', 'subdimensionsHeaderTitle')}
                            </h4>
                        </header>
                        <FaramList
                            faramElementName="subdimensions"
                            keySelector={DimensionContent.keySelector}
                        >
                            <SortableListView
                                faramElement
                                className={styles.subdimensionItemList}
                                dragHandleClassName={styles.dragHandle}
                                itemClassName={styles.subdimensionItem}
                                rendererParams={this.rendererParams}
                                renderer={SubdimensionRow}
                            />
                        </FaramList>
                        <footer className={styles.footer}>
                            <h4 className={styles.label}>
                                {_ts('widgets.editor.matrix2d', 'addSubDimensionsTitle')}
                            </h4>
                            <div className={styles.actions}>
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
                        </footer>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
