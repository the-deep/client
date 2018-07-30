import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rsci/Faram/FaramGroup';
import FaramList from '#rsci/Faram/FaramList';
import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import { randomString } from '#rsu/common';

import { iconNames } from '#constants';


import SubsectorRow from './SubsectorRow';

import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class SectorContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = elem => elem.id;

    static faramInfoForAdd = {
        newElement: () => ({
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
        }),
    }

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

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
                            // FIXME: use strings
                            label={`Sector ${index + 1}`}
                            autoFocus
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="tooltip"
                            // FIXME: use strings
                            label="Tooltip"
                        />
                    </div>
                    <FaramList faramElementName="subsectors">
                        <NonFieldErrors
                            className={styles.error}
                            faramElement
                        />
                        <header className={styles.header}>
                            <h4>
                                {/* FIXME: use strings */}
                                Subsectors
                            </h4>
                            <PrimaryButton
                                faramAction="add"
                                faramInfo={SectorContent.faramInfoForAdd}
                                iconName={iconNames.add}
                                transparent
                            >
                                {/* FIXME: use strings */}
                                Add subsector
                            </PrimaryButton>
                        </header>
                        <SortableListView
                            faramElement
                            className={styles.cellList}
                            dragHandleClassName={styles.dragHandle}
                            itemClassName={styles.item}
                            keyExtractor={SectorContent.keyExtractor}
                            rendererParams={SectorContent.rendererParams}
                            renderer={SubsectorRow}
                        />
                    </FaramList>
                </FaramGroup>
            </div>
        );
    }
}
