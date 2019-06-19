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
            return undefined;
        }

        if (minimumRequirements < 85) {
            return 'Not recommended for use. Use only with caution';
        }

        if (allQualityCriteria > 75) {
            return 'Best practice';
        }
        return 'Recommended for use';
    }

    getUseMessage = (useCriteria) => {
        if (isNotDefined(useCriteria)) {
            return undefined;
        }
        if (useCriteria <= 30) {
            return 'Limited Use';
        } else if (useCriteria <= 60) {
            return 'Average Use';
        }
        return 'Extensive use';
    }

    render() {
        const {
            value,
            className: classNameFromProps,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.scoreItem,
        );

        const minimumRequirements = value['minimum-requirements'];
        const allQualityCriteria = value['all-quality-criteria'];
        const useCriteria = value['use-criteria'];

        const recommendedMessage = this.getRecommendedMessage(
            minimumRequirements,
            allQualityCriteria,
        );
        const useMessage = this.getUseMessage(useCriteria);

        return (
            <div
                className={className}
            >
                { recommendedMessage &&
                    <div>{recommendedMessage}</div>
                }
                { useMessage &&
                    <div>{useMessage}</div>
                }
            </div>
        );
    }
}
