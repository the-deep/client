import React from 'react';
import PropTypes from 'prop-types';
import { FaramOutputElement } from '@togglecorp/faram';
import { isNotDefined } from '@togglecorp/fujs';

import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.number.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    value: {},
};

@FaramOutputElement
export default class ScoreMessage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRecommendedMessage = (minimumRequirements, allQualityCriteria) => {
        if (isNotDefined(minimumRequirements) || isNotDefined(allQualityCriteria)) {
            return {
                message: undefined,
            };
        }

        if (minimumRequirements < 85) {
            return {
                // FIXME: use strings
                message: 'Not recommended for use. Use only with caution',
                style: styles.critical,
            };
        }

        if (allQualityCriteria > 75) {
            return {
                // FIXME: use strings
                message: 'Best practice',
                style: styles.safe,
            };
        }
        return {
            // FIXME: use strings
            message: 'Recommended for use',
            style: styles.safe,
        };
    }

    getUseMessage = (useCriteria) => {
        if (isNotDefined(useCriteria)) {
            return {
                message: undefined,
            };
        }
        if (useCriteria <= 30) {
            return {
                // FIXME: use strings
                message: 'Limited Use',
                style: styles.critical,
            };
        } else if (useCriteria <= 60) {
            return {
                // FIXME: use strings
                message: 'Average Use',
                style: styles.warning,
            };
        }

        return {
            // FIXME: use strings
            message: 'Extensive use',
            style: styles.safe,
        };
    }

    render() {
        const {
            className,
            value,
        } = this.props;

        const minimumRequirements = value['minimum-requirements'];
        const allQualityCriteria = value['all-quality-criteria'];
        const useCriteria = value['use-criteria'];

        const {
            message: recommendedMessage,
            style: recommendedMessageClassName,
        } = this.getRecommendedMessage(minimumRequirements, allQualityCriteria);

        const {
            message: useMessage,
            style: useMessageClassName,
        } = this.getUseMessage(useCriteria);

        return (
            <div className={_cs(className, styles.scoreMessage)} >
                { recommendedMessage &&
                    <span className={recommendedMessageClassName} >
                        {recommendedMessage}
                    </span>
                }
                { useMessage &&
                    <span className={useMessageClassName} >
                        {recommendedMessage &&
                            <span className={styles.separator}>-</span>
                        }
                        {useMessage}
                    </span>
                }
            </div>
        );
    }
}
