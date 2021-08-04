import React from 'react';
import { FaramList } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import AccentButton from '#rsca/Button/AccentButton';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SectorTitle from './SectorTitle';

import styles from './styles.scss';

interface Props {
    className?: string;
    widgetKey?: string;
    // FIXME: the types are wrong
    keySelector: (d: Record<string, unknown>) => number | string;
    titleSelector: (d: Record<string, unknown>) => unknown;
    dataModifier: (d: Record<string, unknown>) => unknown;
    onSectorEditButtonClick: (k: string) => void;
    onAddSectorFaramAction: (k: string) => unknown;
    onGeoLinkModalVisiblityChange: (k: string) => void;
    onLinkWidgetModalVisiblityChange: (k: string) => void;
}

interface State {
}

export default class Column extends React.PureComponent<Props, State> {
    private sectorItemRendererParams = (key: string, elem: Record<string, unknown>, i: number) => ({
        sectorKey: key,
        className: styles.sectorContent,
        data: elem,
        faramElementName: String(i),
        index: i,
        onEditButtonClick: this.props.onSectorEditButtonClick,
    })

    public render() {
        const {
            className,
            dataModifier,
            keySelector,
            onAddSectorFaramAction,
            onGeoLinkModalVisiblityChange,
            onLinkWidgetModalVisiblityChange,
            titleSelector,
            widgetKey,
        } = this.props;

        return (
            <div className={_cs(styles.column, className)}>
                <div className={styles.content}>
                    <FaramList
                        faramElementName="sectors"
                        keySelector={keySelector}
                    >
                        <SortableListView
                            className={styles.sectorList}
                            faramElement
                            rendererParams={this.sectorItemRendererParams}
                            itemClassName={styles.sectorListItem}
                            renderer={SectorTitle}
                            dragHandleClassName={styles.dragHandle}
                        />
                    </FaramList>
                </div>
                <footer className={styles.footer}>
                    <h4 className={styles.label}>
                        {_ts('widgets.editor.matrix2d', 'addSectorsTitle')}
                    </h4>
                    <div className={styles.actions}>
                        <GeoLink
                            faramElementName="sectors"
                            titleSelector={titleSelector}
                            dataModifier={dataModifier}
                            onModalVisibilityChange={onGeoLinkModalVisiblityChange}
                        />
                        <LinkWidgetModalButton
                            faramElementName="sectors"
                            widgetKey={widgetKey}
                            titleSelector={titleSelector}
                            dataModifier={dataModifier}
                            onModalVisibilityChange={onLinkWidgetModalVisiblityChange}
                        />
                        <FaramList
                            faramElementName="sectors"
                            keySelector={keySelector}
                        >
                            <AccentButton
                                faramElementName="add-sector-btn"
                                faramAction={onAddSectorFaramAction}
                                iconName="add"
                                transparent
                            >
                                {_ts('widgets.editor.matrix2d', 'addSectorButtonTitle')}
                            </AccentButton>
                        </FaramList>
                    </div>
                </footer>
            </div>
        );
    }
}
