import React from 'react';
import PropTypes from 'prop-types';

import ListView from '#rs/components/View/List/ListView';
import ListItem from '#components/ListItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    options: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    className: '',
    value: [],
    options: [],
};

const getOptionsForSelect = (params) => {
    const {
        options,
        idSelector,
        labelSelector,
        childSelector,
        prefix = '',
    } = params;

    if (!options || options.length === 0) {
        return [];
    }

    return options.reduce((selections, d) => [
        {
            id: idSelector(d),
            name: `${prefix}${labelSelector(d)}`,
        },
        ...selections,
        ...getOptionsForSelect({
            options: childSelector(d),
            idSelector,
            labelSelector,
            childSelector,
            prefix: `${prefix}${labelSelector(d)} / `,
        }),
    ], []);
};

export default class OrganigramListOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static valueKeySelector = v => v.id;
    static valueLabelSelector = v => v.name;

    static handleDataForOrganigram = (props) => {
        const {
            idSelector,
            labelSelector,
            childSelector,
            options,
            value,
        } = props;

        let selections = [];

        if (options) {
            selections = getOptionsForSelect({
                idSelector,
                labelSelector,
                childSelector,
                options,
            }).filter(o => value.find(v => v === OrganigramListOutput.valueKeySelector(o)));
        }
        return ({ selections, mountSelectInput: !!options });
    };

    constructor(props) {
        super(props);

        const optionsInfo = OrganigramListOutput.handleDataForOrganigram(props);
        this.mountSelectInput = optionsInfo.mountSelectInput;
        this.selections = optionsInfo.selections;
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: newValue,
            options: newOptions,
        } = nextProps;

        const {
            value: oldValue,
            options: oldOptions,
        } = this.props;

        if (newOptions !== oldOptions || newValue !== oldValue) {
            const optionsInfo = OrganigramListOutput.handleDataForOrganigram(nextProps);
            this.mountSelectInput = optionsInfo.mountSelectInput;
            this.selections = optionsInfo.selections;
        }
    }

    rendererParams = (key, option) => ({
        value: OrganigramListOutput.valueLabelSelector(option),
    })

    render() {
        const { className } = this.props;

        return (
            <ListView
                className={`${className} ${styles.list}`}
                data={this.selections}
                keyExtractor={OrganigramListOutput.valueKeySelector}
                renderer={ListItem}
                rendererParams={this.rendererParams}
            />
        );
    }
}
