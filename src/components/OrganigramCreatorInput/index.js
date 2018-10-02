import PropTypes from 'prop-types';
import React from 'react';

import { randomString } from '#rsu/common';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import { FaramInputElement } from '#rscg/FaramElements';
import TextInput from '#rsci/TextInput';
import List from '#rscv/List';
import update from '#rsu/immutable-update';

import { iconNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    index: PropTypes.number,
    level: PropTypes.number,
};

const defaultProps = {
    value: {
        key: 'organ-base',
        title: '',
        organs: [],
    },
    onChange: () => {},
    index: undefined,
    disabled: false,
    level: 1,
};

@FaramInputElement
export default class OrganigramCreatorInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = organ => organ.key;

    handleTextChange = (val) => {
        const settings = {
            title: { $set: val },
        };
        const newVal = update(this.props.value, settings);
        this.props.onChange(newVal, this.props.index);
    }

    handleOrganAdd = () => {
        const newOrgan = {
            key: `organ-${randomString()}`,
            title: '',
            organs: [],
        };
        const settings = {
            organs: { $push: [newOrgan] },
        };
        const newVal = update(this.props.value, settings);
        this.props.onChange(newVal, this.props.index);
    }

    handleOrganRemove = () => {
        this.props.onChange(undefined, this.props.index);
    }

    handleChange = (val, index) => {
        const settings = {
            organs: {
                // NOTE: when val is not defined, the child of given index is removed
                $splice: [
                    val ? [index, 1, val] : [index, 1],
                ],
            },
        };
        const newVal = update(this.props.value, settings);
        this.props.onChange(newVal, this.props.index);
    }

    rendererParams = (key, organ, i) => ({
        index: i,
        level: this.props.level + 1,
        value: organ,
        onChange: this.handleChange,
        disabled: this.props.disabled,
    })

    render() {
        const {
            value,
            disabled,
            level,
        } = this.props;

        const isFatherOrgan = level === 1;

        return (
            <div className={styles.organ}>
                <div className={styles.organHeader}>
                    <TextInput
                        value={value.title}
                        className={styles.titleInput}
                        showHintAndError={false}
                        placeholder={_ts('components.organigramCreator', 'organPlaceholder', { level })}
                        showLabel={false}
                        onChange={this.handleTextChange}
                        disabled={disabled}
                        autoFocus
                    />
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            className={styles.actionButton}
                            onClick={this.handleOrganAdd}
                            title={_ts('components.organigramCreator', 'addChildButtonTitle')}
                            tabIndex="-1"
                            transparent
                            iconName={iconNames.fork}
                            disabled={disabled}
                        />
                        {
                            !isFatherOrgan && (
                                <DangerButton
                                    className={styles.actionButton}
                                    onClick={this.handleOrganRemove}
                                    title={_ts('components.organigramCreator', 'removeElementButtonTitle')}
                                    tabIndex="-1"
                                    transparent
                                    iconName={iconNames.trash}
                                    disabled={disabled}
                                />
                            )
                        }
                    </div>
                </div>
                <div className={styles.organBody}>
                    <List
                        data={value.organs}
                        renderer={OrganigramCreatorInput}
                        keySelector={OrganigramCreatorInput.keySelector}
                        rendererParams={this.rendererParams}
                    />
                </div>
            </div>
        );
    }
}
