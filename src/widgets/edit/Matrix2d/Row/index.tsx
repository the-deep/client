import React from 'react';
import { FaramList } from '@togglecorp/faram';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';
import Label from '#rsci/Label';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import DimensionTitle from '../DimensionTitle';
import DimensionContent from '../DimensionContent';

import styles from './styles.scss';

interface Props {
    className?: string;
}

interface State {
}

const emptyList: unknown[] = [];
const emptyObject = {};

export default class Row extends React.PureComponent<Props, State> {
    private dimensionItemRendererParams = (key, elem, i) => ({
        className: styles.dimensionContent,
        data: elem,
        faramElementName: String(i),
        index: i,
        keySelector: this.props.keySelector,
        onEditButtonClick: () => {
            this.props.onDimensionEditButtonClick(key);
        },
    })

    public render() {
        const {
            className,
            dataModifier,
            faramValues = emptyObject,
            keySelector,
            onAddDimensionFaramAction,
            onGeoLinkModalVisiblityChange,
            onLinkWidgetModalVisiblityChange,
            onDimensionContentBackButtonClick,
            selectedDimensionKey,
            titleSelector,
            widgetKey,
        } = this.props;

        const { dimensions = emptyList } = faramValues;
        const selectedDimensionIndex = dimensions.findIndex(
            dimension => (keySelector(dimension) === selectedDimensionKey),
        );

        return (
            <div className={_cs(className, styles.row)}>
                <header className={styles.header}>
                    <TextInput
                        className={styles.titleRowHeightInput}
                        faramElementName="titleRowHeight"
                        label="Title row height"
                        type="number"
                        persistantHintAndError={false}
                    />
                    <div className={styles.right}>
                        <Label
                            className={styles.label}
                            text={_ts('widgets.editor.matrix2d', 'addDimensionsTitle')}
                        />
                        <div className={styles.actions}>
                            <GeoLink
                                dataModifier={dataModifier}
                                faramElementName="dimensions"
                                onModalVisibilityChange={onGeoLinkModalVisiblityChange}
                                titleSelector={titleSelector}
                            />
                            <LinkWidgetModalButton
                                dataModifier={dataModifier}
                                faramElementName="dimensions"
                                onModalVisibilityChange={onLinkWidgetModalVisiblityChange}
                                titleSelector={titleSelector}
                                widgetKey={widgetKey}
                            />
                            <FaramList
                                faramElementName="dimensions"
                                keySelector={keySelector}
                            >
                                <AccentButton
                                    faramAction={onAddDimensionFaramAction}
                                    faramElementName="add-dimension-btn"
                                    iconName="add"
                                    transparent
                                >
                                    {_ts('widgets.editor.matrix2d', 'addDimensionButtonTitle')}
                                </AccentButton>
                            </FaramList>
                        </div>
                    </div>
                </header>
                <div className={styles.content}>
                    <FaramList
                        faramElementName="dimensions"
                        keySelector={keySelector}
                    >
                        { (isDefined(selectedDimensionIndex)
                            && selectedDimensionIndex !== -1) ? (
                                <DimensionContent
                                    className={styles.dimensionDetails}
                                    index={selectedDimensionIndex}
                                    onBackButtonClick={onDimensionContentBackButtonClick}
                                    widgetKey={widgetKey}
                                />
                            ) : (
                                <SortableListView
                                    className={styles.dimensionList}
                                    faramElement
                                    rendererParams={this.dimensionItemRendererParams}
                                    itemClassName={styles.dimensionListItem}
                                    renderer={DimensionTitle}
                                    dragHandleClassName={styles.dragHandle}
                                />
                            )
                        }
                    </FaramList>
                </div>
            </div>
        );
    }
}
