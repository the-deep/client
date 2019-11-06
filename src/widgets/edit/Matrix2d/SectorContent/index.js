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
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import Button from '#rsca/Button';

import _ts from '#ts';

import LinkWidgetModalButton from '#widgetComponents/LinkWidgetModal/Button';
import GeoLink from '#widgetComponents/GeoLink';

import SubsectorRow from './SubsectorRow';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
    widgetKey: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
};

const TextOutput = FaramOutputElement(props => (
    <div className={props.className}>
        { props.value }
    </div>
));

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

    static rendererParams = (key, elem, i) => ({
        index: i,
        className: styles.subSectorContent,
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
            <div className={_cs(styles.sectorContent, className)}>
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
                        className={styles.error}
                        faramElement
                    />
                    <div className={styles.editSector}>
                        <div className={styles.top}>
                            <TextInput
                                className={styles.titleInput}
                                faramElementName="title"
                                label={_ts('widgets.editor.matrix2d', 'unnamedSectorLabel', { index: index + 1 })}
                                autoFocus
                            />
                            <TextInput
                                type="number"
                                label="Font size"
                                className={styles.fontSizeInput}
                                faramElementName="fontSize"
                            />
                        </div>
                        <div className={styles.bottom}>
                            <TextArea
                                className={styles.tooltipInput}
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
                        />
                    </FaramList>
                    <div className={styles.subSectorListContainer}>
                        <header className={styles.header}>
                            <h4 className={styles.heading}>
                                {_ts('widgets.editor.matrix2d', 'subsectorsHeaderTitle')}
                            </h4>
                            <div className={styles.right} >
                                <h5 className={styles.heading}>
                                    {_ts('widgets.editor.matrix2d', 'addSubSectorTitle')}
                                </h5>
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
                        </header>
                        <FaramList
                            faramElementName="subsectors"
                            keySelector={SectorContent.keySelector}
                        >
                            <SortableListView
                                faramElement
                                className={styles.cellList}
                                dragHandleClassName={styles.dragHandle}
                                itemClassName={styles.item}
                                rendererParams={SectorContent.rendererParams}
                                renderer={SubsectorRow}
                            />
                        </FaramList>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}
