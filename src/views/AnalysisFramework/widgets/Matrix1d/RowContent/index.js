import PropTypes from 'prop-types';
import React from 'react';

import FaramGroup from '#rsci/Faram/FaramGroup';
import FaramList from '#rsci/Faram/FaramList';
import SortableListView from '#rscv/SortableListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import ColorInput from '#rsci/ColorInput';
import { randomString } from '#rsu/common';

import { iconNames } from '#constants';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    index: PropTypes.number.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class RowContent extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = elem => elem.key;

    static faramInfoForAdd = {
        newElement: () => ({
            key: randomString(16).toLowerCase(),
            value: '',
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
                    <div className={styles.editRow}>
                        <ColorInput
                            // className={styles.input}
                            faramElementName="color"
                            label="Color"
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="title"
                            // FIXME: use strings
                            label={`Row ${index + 1}`}
                            autoFocus
                        />
                        <TextInput
                            className={styles.input}
                            faramElementName="tooltip"
                            // FIXME: use strings
                            label="Tooltip"
                        />
                    </div>
                    <FaramList faramElementName="cells">
                        <NonFieldErrors
                            className={styles.error}
                            faramElement
                        />
                        <header className={styles.header}>
                            <h4>
                                {/* FIXME: use strings */}
                                Cells
                            </h4>
                            <PrimaryButton
                                faramAction="add"
                                faramInfo={RowContent.faramInfoForAdd}
                                iconName={iconNames.add}
                                transparent
                            >
                                {/* FIXME: use strings */}
                                Add Cell
                            </PrimaryButton>
                        </header>
                        <SortableListView
                            faramElement
                            className={styles.cellList}
                            dragHandleClassName={styles.dragHandle}
                            itemClassName={styles.item}
                            keyExtractor={RowContent.keyExtractor}
                            rendererParams={RowContent.rendererParams}
                            renderer={InputRow}
                        />
                    </FaramList>
                </FaramGroup>
            </div>
        );
    }
}
