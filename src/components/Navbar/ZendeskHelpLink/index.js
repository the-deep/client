import PropTypes from 'prop-types';
import React from 'react';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';
import { listToMap } from '#rsu/common';
import iconNames from '#constants/iconNames';

const propTypes = {
    className: PropTypes.string,
    currentPath: PropTypes.string.isRequired,

    // Requests Props
    // eslint-disable-next-line react/forbid-prop-types
    zendeskLinkRequest: PropTypes.object.isRequired,
    setDefaultRequestParams: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const requests = {
    zendeskLinkRequest: {
        // TODO: Define this schema
        schema: 'zendeskLinkGetRequest',
        onMount: true,
        url: '/pages/',
        onSuccess: ({ response, params: { setState } }) => {
            setState({
                pagesInfo: listToMap(
                    response.results, d => d.pageId,
                ),
            });
        },
    },
};

const emptyObject = {};

@RequestCoordinator
@RequestClient(requests)
export default class ZendeskHelpLink extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pagesInfo: {},
        };

        this.props.setDefaultRequestParams({
            setState: params => this.setState(params),
        });
    }

    render() {
        const {
            className,
            currentPath,
            zendeskLinkRequest,
        } = this.props;
        const { pagesInfo } = this.state;

        const meta = (
            pagesInfo[currentPath] || pagesInfo.default || emptyObject
        );

        return (
            // TODO: Styling
            <div className={className} >
                <a
                    href={meta.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={zendeskLinkRequest.pending}
                >
                    <span className={iconNames.help} />
                </a>
            </div>
        );
    }
}
