import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rs/components/Input/Faram/FaramGroup';
import FaramList from '#rs/components/Input/Faram/FaramList';
import SortableListView from '#rs/components/View/SortableListView';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rs/components/Input/TextInput';
import ColorInput from '#rs/components/Input/ColorInput';
import { randomString } from '#rsu/common';

import { iconNames } from '#constants';

import SubdimensionRow from './SubdimensionRow';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class DimensionContent extends React.PureComponent {
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
                    <div className={styles.editDimension}>
                        <ColorInput
                            // className={styles.input}
                            faramElementName="color"
                            label="Color"
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="title"
                            // FIXME: use strings
                            label={`Dimension ${index + 1}`}
                            autoFocus
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="tooltip"
                            // FIXME: use strings
                            label="Tooltip"
                        />
                    </div>
                    <FaramList faramElementName="subdimensions">
                        <NonFieldErrors
                            className={styles.error}
                            faramElement
                        />
                        <header className={styles.header}>
                            <h4>
                                {/* FIXME: use strings */}
                                Subdimensions
                            </h4>
                            <PrimaryButton
                                faramAction="add"
                                faramInfo={DimensionContent.faramInfoForAdd}
                                iconName={iconNames.add}
                                transparent
                            >
                                {/* FIXME: use strings */}
                                Add subdimension
                            </PrimaryButton>
                        </header>
                        <SortableListView
                            faramElement
                            className={styles.cellList}
                            dragHandleClassName={styles.dragHandle}
                            itemClassName={styles.item}
                            keyExtractor={DimensionContent.keyExtractor}
                            rendererParams={DimensionContent.rendererParams}
                            renderer={SubdimensionRow}
                        />
                    </FaramList>
                </FaramGroup>
            </div>
        );
    }
}
