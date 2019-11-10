import React from 'react';
import {
    FaramList,
    FaramGroup,
} from '@togglecorp/faram';
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

import SectorTitle from './SectorTitle';
import SectorContent from './SectorContent';

import styles from './styles.scss';

interface Props {
    className?: string;
}

interface State {
}

const emptyList: unknown[] = [];
const emptyObject = {};

export default class Column extends React.PureComponent<Props, State> {
    private sectorItemRendererParams = (key, elem, i) => ({
        className: styles.sectorContent,
        data: elem,
        faramElementName: String(i),
        index: i,
        onEditButtonClick: () => {
            this.props.onSectorEditButtonClick(key);
        },
        keySelector: this.props.keySelector,
    })

    public render() {
        const {
            className,
            dataModifier,
            faramValues = emptyObject,
            keySelector,
            onAddSectorFaramAction,
            onGeoLinkModalVisiblityChange,
            onLinkWidgetModalVisiblityChange,
            onSectorContentBackButtonClick,
            selectedSectorKey,
            titleSelector,
            widgetKey,
        } = this.props;

        const { sectors = emptyList } = faramValues;
        const selectedSectorIndex = sectors
            .findIndex(sector => (keySelector(sector) === selectedSectorKey));

        return (
            <div className={_cs(styles.column, className)}>
                <header className={styles.header}>
                    <div className={styles.top}>
                        <FaramGroup faramElementName="meta">
                            <TextInput
                                type="number"
                                label="Title column width"
                                className={styles.titleColumnWidthInput}
                                faramElementName="titleColumnWidth"
                                persistantHintAndError={false}
                            />
                            <TextInput
                                type="number"
                                label="Subtitle column width"
                                className={styles.subTitleColumnWidthInput}
                                faramElementName="subTitleColumnWidth"
                                persistantHintAndError={false}
                            />
                        </FaramGroup>
                    </div>
                    <div className={styles.bottom}>
                        <Label
                            className={styles.label}
                            text={_ts('widgets.editor.matrix2d', 'addSectorsTitle')}
                        />
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
                </header>
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
            </div>
        );
    }
}
