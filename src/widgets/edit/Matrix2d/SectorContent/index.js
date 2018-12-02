import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rscg/FaramGroup';
import FaramList from '#rscg/FaramList';
import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import AccentButton from '#rsca/Button/AccentButton';
import TextInput from '#rsci/TextInput';
import { randomString } from '#rsu/common';

import _ts from '#ts';
import { iconNames } from '#constants';

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
        } = this.props;

        return (
            <div className={className}>
                <FaramGroup faramElementName={String(index)}>
                    <NonFieldErrors
                        className={styles.error}
                        faramElement
                    />
                    <div className={styles.editSector}>
                        <TextInput
                            className={styles.input}
                            faramElementName="title"
                            label={_ts('widgets.editor.matrix2d', 'unnamedSectorLabel', { index: index + 1 })}
                            autoFocus
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="tooltip"
                            label={_ts('widgets.editor.matrix2d', 'tooltipLabel')}
                        />
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
                    <header className={styles.header}>
                        <h4>
                            {_ts('widgets.editor.matrix2d', 'subsectorsHeaderTitle')}
                        </h4>
                        <div className={styles.buttonContainer} >
                            <h5>
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
                                    iconName={iconNames.add}
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
                </FaramGroup>
            </div>
        );
    }
}
