import PropTypes from 'prop-types';
import React from 'react';
import {
    FaramList,
    FaramGroup,
    FaramOutputElement,
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
import SegmentInput from '#rsci/SegmentInput';
import TextArea from '#rsci/TextArea';
import ColorInput from '#rsci/ColorInput';
import Label from '#rsci/Label';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SubdimensionRow from './SubdimensionRow';
import styles from './styles.scss';

const TextOutput = FaramOutputElement(props => (
    <div className={props.className}>
        { props.value }
    </div>
));

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
};

const orientationOptions = [
    { key: 'leftToRight', label: 'A' },
    { key: 'bottomToTop', label: 'A' },
];

const OrientationInputItem = ({
    data,
}) => (
    data.key === 'bottomToTop' ? (
        <div className={styles.rotatedText}>
            { data.label }
        </div>
    ) : data.label
);

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
        className: styles.subDimensionContent,
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
            onBackButtonClick,
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
                        <TextOutput
                            className={styles.title}
                            faramElementName="title"
                        />
                    </header>
                    <NonFieldErrors
                        className={styles.nonFieldErrors}
                        faramElement
                    />
                    <div className={styles.editDimension}>
                        <div className={styles.top}>
                            <ColorInput
                                className={styles.colorInput}
                                faramElementName="color"
                                label={_ts('widgets.editor.matrix2d', 'colorLabel')}
                                persistantHintAndError={false}
                            />
                            <TextInput
                                className={styles.titleInput}
                                faramElementName="title"
                                label={_ts('widgets.editor.matrix2d', 'unnamedDimensionLabel', { index: index + 1 })}
                                autoFocus
                                persistantHintAndError={false}
                            />
                            <SegmentInput
                                label="Orientation"
                                options={orientationOptions}
                                renderer={OrientationInputItem}
                                faramElementName="orientation"
                                className={styles.orientationInput}
                                persistantHintAndError={false}
                            />
                            <TextInput
                                type="number"
                                label="Font size"
                                className={styles.fontSizeInput}
                                faramElementName="fontSize"
                                persistantHintAndError={false}
                            />
                            <TextInput
                                type="number"
                                label="Height"
                                className={styles.heightInput}
                                faramElementName="height"
                                persistantHintAndError={false}
                            />
                        </div>
                        <div className={styles.bottom}>
                            <TextArea
                                className={styles.tooltipInput}
                                faramElementName="tooltip"
                                label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
                                persistantHintAndError={false}
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
                        />
                    </FaramList>
                    <div className={styles.subDimensionListContainer}>
                        <header className={styles.header}>
                            <h4 className={styles.heading}>
                                {_ts('widgets.editor.matrix2d', 'subdimensionsHeaderTitle')}
                            </h4>
                            <div className={styles.right} >
                                <Label
                                    text={_ts('widgets.editor.matrix2d', 'addSubDimensionsTitle')}
                                />
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
                                className={styles.subdimensionItemList}
                                dragHandleClassName={styles.dragHandle}
                                itemClassName={styles.subdimensionItem}
                                rendererParams={DimensionContent.rendererParams}
                                renderer={SubdimensionRow}
                            />
                        </FaramList>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
