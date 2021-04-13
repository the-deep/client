import React from 'react';
import { FaramList } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import AccentButton from '#rsca/Button/AccentButton';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import DimensionTitle from './DimensionTitle';

import styles from './styles.scss';

interface Props {
    className?: string;
    widgetKey?: string;
    keySelector: (d: Record<string, unknown>) => string | number;
    titleSelector: (d: Record<string, unknown>) => unknown;
    dataModifier: (d: Record<string, unknown>) => unknown;
    onDimensionEditButtonClick: (k: string) => void;
    onAddDimensionFaramAction: (k: string) => unknown;
    onGeoLinkModalVisiblityChange: (k: string) => void;
    onLinkWidgetModalVisiblityChange: (k: string) => void;
}

interface State {
}

export default class Row extends React.PureComponent<Props, State> {
    private dimensionItemRendererParams = (
        key: string,
        elem: Record<string, unknown>,
        i: number,
    ) => ({
        dimensionKey: key,
        className: styles.dimensionContent,
        // FIXME: should only inject title instead of the whole data
        data: elem,
        faramElementName: String(i),
        index: i,
        onEditButtonClick: this.props.onDimensionEditButtonClick,
    })

    public render() {
        const {
            className,
            dataModifier,
            keySelector,
            onAddDimensionFaramAction,
            onGeoLinkModalVisiblityChange,
            onLinkWidgetModalVisiblityChange,
            titleSelector,
            widgetKey,
        } = this.props;

        return (
            <div className={_cs(className, styles.row)}>
                <div className={styles.content}>
                    <FaramList
                        faramElementName="dimensions"
                        keySelector={keySelector}
                    >
                        <SortableListView
                            className={styles.dimensionList}
                            faramElement
                            rendererParams={this.dimensionItemRendererParams}
                            itemClassName={styles.dimensionListItem}
                            renderer={DimensionTitle}
                            dragHandleClassName={styles.dragHandle}
                        />
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
