import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';
import DangerButton from '#rsca/Button/DangerButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    keywords: PropTypes.arrayOf(PropTypes.string),
    onDelete: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    keywords: [],
};

export default class NGram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    keySelectorForKeyword = keyword => keyword;

    renderKeyword = (key, data) => (
        <div
            key={key}
            className={styles.keyword}
        >
            <div className={styles.title}>
                { data }
            </div>
            <div className={styles.actionButtons}>
                <DangerButton
                    onClick={() => this.props.onDelete(data)}
                    transparent
                    iconName="delete"
                />
            </div>
        </div>
    )

    render() {
        const {
            keywords,
            className,
        } = this.props;

        return (
            <ListView
                className={`${styles.ngram} ${className}`}
                data={keywords}
                modifier={this.renderKeyword}
                keySelector={this.keySelectorForKeyword}
            />
        );
    }
}
