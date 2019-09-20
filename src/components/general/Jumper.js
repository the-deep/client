import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};
const defaultProps = {
    active: false,
    className: undefined,
};

export default class Jumper extends React.Component {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.divRef = React.createRef();
    }

    componentDidMount() {
        const { active } = this.props;
        if (active) {
            this.handleAutoScroll();
        }
    }

    componentWillReceiveProps(nextProps) {
        const { active: oldActive } = this.props;
        const { active: newActive } = nextProps;
        if (oldActive !== newActive && newActive) {
            this.handleAutoScroll();
        }
    }

    handleAutoScroll = () => {
        setTimeout(() => {
            if (this.divRef.current) {
                this.divRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 0);
    }

    render() {
        const {
            children,
            className,
        } = this.props;
        return (
            <div
                ref={this.divRef}
                className={className}
            >
                {children}
            </div>
        );
    }
}
