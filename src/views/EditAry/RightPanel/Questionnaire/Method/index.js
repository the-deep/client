import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import SubMethod from '../SubMethod';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
};

const getSubMethodRendererParams = (_, d) => ({ data: d });
const subMethodKeySelector = d => d.id;

export default class Method extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            data,
        } = this.props;

        return (
            <div className={_cs(className, styles.method)}>
                <div className={styles.title}>
                    { data.title }
                </div>
                <ListView
                    className={styles.subMethodList}
                    data={data.subSectors}
                    renderer={SubMethod}
                    rendererParams={getSubMethodRendererParams}
                    keySelector={subMethodKeySelector}
                />
            </div>
        );
    }
}
