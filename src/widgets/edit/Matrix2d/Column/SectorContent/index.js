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
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import Button from '#rsca/Button';

import OrientationInput from '#components/general/OrientationInput';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SubsectorRow from './SubsectorRow';
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

export default class SectorContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.id;
    static rowTitleSelector = d => d.title;

    static addSubsectorClick = subsectors => ([
        ...subsectors,
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
        className: styles.subSectorContent,
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
            <div className={_cs(styles.sectorContent, className)}>
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
                        className={styles.error}
                        faramElement
                        persistent={false}
                    />
                    <div className={styles.editSector}>
                        <div className={styles.top}>
                            <TextInput
                                className={styles.titleInput}
                                faramElementName="title"
                                label={_ts('widgets.editor.matrix2d', 'unnamedSectorLabel', { index: index + 1 })}
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
                                        label={_ts('widgets.editor.matrix2d', 'widthInputLabel')}
                                        className={styles.widthInput}
                                        faramElementName="width"
                                        placeholder={_ts('widgets.editor.matrix2d', 'widthInputPlaceholder')}
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
                        faramElementName="subsectors"
                        keySelector={SectorContent.keySelector}
                    >
                        <NonFieldErrors
                            className={styles.error}
                            faramElement
                            persistent={false}
                        />
                    </FaramList>
                    <div className={styles.subSectorListContainer}>
                        <header className={styles.header}>
                            <h4 className={styles.heading}>
                                {_ts('widgets.editor.matrix2d', 'subsectorsHeaderTitle')}
                            </h4>
                        </header>
                        <FaramList
                            faramElementName="subsectors"
                            keySelector={SectorContent.keySelector}
                        >
                            <SortableListView
                                faramElement
                                className={styles.subsectorList}
                                dragHandleClassName={styles.dragHandle}
                                itemClassName={styles.item}
                                rendererParams={this.rendererParams}
                                renderer={SubsectorRow}
                            />
                        </FaramList>
                        <footer className={styles.footer} >
                            <h4 className={styles.label}>
                                {_ts('widgets.editor.matrix2d', 'addSubSectorTitle')}
                            </h4>
                            <div className={styles.actions}>
                                <GeoLink
                                    faramElementName="subsectors"
                                    titleSelector={SectorContent.rowTitleSelector}
                                    lastItemTitle="subcells"
                                    dataModifier={SectorContent.rowsModifier}
                                />
                                <LinkWidgetModalButton
                                    faramElementName="subsectors"
                                    lastItemTitle="subsectors"
                                    widgetKey={this.props.widgetKey}
                                    titleSelector={SectorContent.rowTitleSelector}
                                    dataModifier={SectorContent.rowsModifier}
                                />
                                <FaramList
                                    faramElementName="subsectors"
                                    keySelector={SectorContent.keySelector}
                                >
                                    <AccentButton
                                        faramElementName="add-btn"
                                        faramAction={SectorContent.addSubsectorClick}
                                        iconName="add"
                                        transparent
                                    >
                                        {_ts('widgets.editor.matrix2d', 'addSubsectorButtonTitle')}
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
