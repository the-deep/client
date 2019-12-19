import React from 'react';
import PropTypes from 'prop-types';
import { FaramGroup } from '@togglecorp/faram';

import ListView from '#rscv/List/ListView';

import {
    isDataCollectionTechniqueColumn,
    getProps,
} from '#entities/editAry';

import BaseWidget from '#entities/editAry/BaseWidget';

import styles from './styles.scss';

const propTypes = {
    sources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    index: PropTypes.number.isRequired,
    secondaryDataReviewSelected: PropTypes.bool.isRequired,
    fields: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    fields: [],
};

export default class Column extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    fieldKeySelector = data => data.id;

    fieldRendererParams = (key, data) => {
        const {
            sources,
            secondaryDataReviewSelected,
        } = this.props;

        const { fieldType } = data;

        const isHidden = !isDataCollectionTechniqueColumn(data) && secondaryDataReviewSelected;
        const widgetProps = getProps(data, sources);

        return {
            ...widgetProps,
            className: styles.cellItem,
            fieldType,
            hidden: isHidden,
        };
    }

    render() {
        const {
            index,
            fields,
        } = this.props;

        return (
            <FaramGroup
                faramElementName={String(index)}
            >
                <ListView
                    className={styles.cell}
                    data={fields}
                    rendererParams={this.fieldRendererParams}
                    renderer={BaseWidget}
                    keySelector={Column.fieldKeySelector}
                />
            </FaramGroup>
        );
    }
}
