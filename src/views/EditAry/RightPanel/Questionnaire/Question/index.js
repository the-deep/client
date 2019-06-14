import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';
import { FaramGroup } from '@togglecorp/faram';

import SegmentInput from '#rsci/SegmentInput';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

const answerOptions = [
    { key: 'yes', label: 'Yes' },
    { key: 'no', label: 'No' },
];

const answerOptionKeySelector = d => d.key;
const answerOptionLabelSelector = d => d.label;

export default class Method extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            data,
        } = this.props;

        return (
            <div className={_cs(className, styles.question)}>
                <div className={styles.title}>
                    { data.text }
                </div>
                <div className={styles.options}>
                    <FaramGroup faramElementName={String(data.id)}>
                        <SegmentInput
                            faramElementName="value"
                            options={answerOptions}
                            keySelector={answerOptionKeySelector}
                            labelSelector={answerOptionLabelSelector}
                            showLabel={false}
                            showHintAndError={false}
                        />
                    </FaramGroup>
                </div>
            </div>
        );
    }
}
