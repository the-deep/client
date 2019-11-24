import React from 'react';
import { FaramList } from '@togglecorp/faram';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import AccentButton from '#rsca/Button/AccentButton';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SectorTitle from './SectorTitle';
import SectorContent from './SectorContent';

import styles from './styles.scss';

interface Sector {
    id?: number;
    subsectors?: [];
}

interface FaramValues {
    sectors?: [Sector];
}

interface Props {
    className?: string;
    faramValues?: FaramValues;
    selectedSectorKey?: string;
    widgetKey?: string;
    keySelector: (d: object) => {};
    titleSelector: (d: object) => {};
    dataModifier: (d: object) => {};
    onSectorEditButtonClick: (k: string) => {};
    onAddSectorFaramAction: (k: string) => {};
    onGeoLinkModalVisiblityChange: (k: string) => {};
    onLinkWidgetModalVisiblityChange: (k: string) => {};
    onSectorContentBackButtonClick: (k: string) => {};
}

interface State {
}

export default class Column extends React.PureComponent<Props, State> {
    private sectorItemRendererParams = (key: string, elem: object, i: number) => ({
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
            faramValues,
            keySelector,
            onAddSectorFaramAction,
            onGeoLinkModalVisiblityChange,
            onLinkWidgetModalVisiblityChange,
            onSectorContentBackButtonClick,
            selectedSectorKey,
            titleSelector,
            widgetKey,
        } = this.props;

        let selectedSectorIndex;
        if (faramValues && faramValues.sectors) {
            const { sectors } = faramValues;
            selectedSectorIndex = sectors
                .findIndex(sector => (keySelector(sector) === selectedSectorKey));
        }

        return (
            <div className={_cs(styles.column, className)}>
                <div className={styles.content}>
                    <FaramList
                        faramElementName="sectors"
                        keySelector={keySelector}
                    >
                        { isDefined(selectedSectorKey) && selectedSectorIndex !== -1 ? (
                            <SectorContent
                                index={selectedSectorIndex}
                                className={styles.sectorDetails}
                                onBackButtonClick={onSectorContentBackButtonClick}
                                widgetKey={widgetKey}
                            />
                        ) : (
                            <SortableListView
                                className={styles.sectorList}
                                faramElement
                                rendererParams={this.sectorItemRendererParams}
                                itemClassName={styles.sectorListItem}
                                renderer={SectorTitle}
                                dragHandleClassName={styles.dragHandle}
                            />
                        )}
                    </FaramList>
                </div>
                {(isNotDefined(selectedSectorIndex) || selectedSectorIndex === -1) && (
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
                )}
            </div>
        );
    }
}
