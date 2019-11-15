import React from 'react';
import { FaramList } from '@togglecorp/faram';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import AccentButton from '#rsca/Button/AccentButton';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import DimensionTitle from '../DimensionTitle';
import DimensionContent from '../DimensionContent';

import styles from './styles.scss';

interface Dimension {
    color?: string;
    id?: number;
    subdimensions?: [];
}

interface FaramValues {
    dimensions?: [Dimension];
}

interface Props {
    className?: string;
    faramValues?: FaramValues;
    selectedDimensionKey?: string;
    widgetKey?: string;
    keySelector: (d: object) => {};
    titleSelector: (d: object) => {};
    dataModifier: (d: object) => {};
    onDimensionEditButtonClick: (k: string) => {};
    onAddDimensionFaramAction: (k: string) => {};
    onGeoLinkModalVisiblityChange: (k: string) => {};
    onLinkWidgetModalVisiblityChange: (k: string) => {};
    onDimensionContentBackButtonClick: (k: string) => {};
}

interface State {
}

export default class Row extends React.PureComponent<Props, State> {
    private dimensionItemRendererParams = (key: string, elem: object, i: number) => ({
        dimensionKey: key,
        className: styles.dimensionContent,
        data: elem,
        faramElementName: String(i),
        index: i,
        onEditButtonClick: this.props.onDimensionEditButtonClick,
    })

    public render() {
        const {
            className,
            dataModifier,
            faramValues,
            keySelector,
            onAddDimensionFaramAction,
            onGeoLinkModalVisiblityChange,
            onLinkWidgetModalVisiblityChange,
            onDimensionContentBackButtonClick,
            selectedDimensionKey,
            titleSelector,
            widgetKey,
        } = this.props;

        let selectedDimensionIndex;

        if (faramValues && faramValues.dimensions) {
            const { dimensions } = faramValues;
            selectedDimensionIndex = dimensions.findIndex(
                dimension => (keySelector(dimension) === selectedDimensionKey),
            );
        }

        return (
            <div className={_cs(className, styles.row)}>
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
                <footer className={styles.footer}>
                    <h4 className={styles.label}>
                        {_ts('widgets.editor.matrix2d', 'addDimensionsTitle')}
                    </h4>
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
                </footer>
            </div>
        );
    }
}
