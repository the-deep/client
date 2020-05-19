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

// FIXME: this is not used
interface Sector {
    id?: number;
    subsectors?: [];
}

interface Props {
    className?: string;
    widgetKey?: string;
    // FIXME: the typings are wrong
    keySelector: (d: object) => number | string;
    titleSelector: (d: object) => {};
    dataModifier: (d: object) => {};
    onSectorEditButtonClick: (k: string) => {};
    onAddSectorFaramAction: (k: string) => {};
    onGeoLinkModalVisiblityChange: (k: string) => {};
    onLinkWidgetModalVisiblityChange: (k: string) => {};
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
