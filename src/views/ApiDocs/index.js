import React from 'react';

import { FgRestBuilder } from '#rsu/rest';
import { isObjectEmpty, compareString } from '#rsu/common';
import List from '#rscv/List';
import ListView from '#rscv/List/ListView';
import Page from '#rscv/Page';

import _ts from '#ts';
import { urlForApiDocs } from '#rest';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

export default class ApiDocs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            docs: {},
            expanded: [],
            pending: true,
        };
    }

    componentWillMount() {
        this.fetchApiDocs(urlForApiDocs);
    }

    fetchApiDocs = (url) => {
        // Stop any retry action
        if (this.apiDocsRequest) {
            this.apiDocsRequest.stop();
        }

        this.apiDocsRequest = new FgRestBuilder()
            .url(url)
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                // FIXME: write schema
                this.setState(
                    { docs: this.preprocessDocs(response) },
                    () => console.log(this.state.docs),
                );
            })
            .build();

        this.apiDocsRequest.start();
    }

    mapMethod = methodTitle => (
        {
            create: 'POST',
            destroy: 'DELETE',
            list: 'GET',
            partial_update: 'PATCH',
            retrieve: 'GET',
            update: 'PUT',
        }[methodTitle] || methodTitle
    );

    preprocessDocs = (docs) => {
        docs.apis.forEach((api) => {
            api.endpoints.sort((e1, e2) => compareString(e1.title, e2.title));

            api.endpoints.forEach(endpoint => (
                endpoint.methods.sort((m1, m2) => compareString(m1.title, m2.title))
            ));
        });
        return docs;
    }

    toggleExpand = (endpoint) => {
        const key = endpoint.title;
        if (this.state.expanded.indexOf(key) === -1) {
            this.setState({
                expanded: [...this.state.expanded, key],
            });
        } else {
            this.setState({
                expanded: this.state.expanded.filter(e => e !== key),
            });
        }
    };

    calcApiKey = api => api.title
    calcEndpointKey = method => method.title
    calcMethodKey = method => method.title

    renderDocs = docs => (
        <div className={styles.docs}>
            <h1>{docs.title}</h1>
            <List
                data={docs.apis}
                keySelector={this.calcApiKey}
                modifier={this.renderApi}
            />
        </div>
    )

    renderApi = (key, api) => (
        <div
            key={key}
            className={styles.api}
        >
            <h2>api-{api.title}</h2>
            <List
                data={api.endpoints}
                keySelector={this.calcEndpointKey}
                modifier={this.renderEndpoint}
            />
        </div>
    )

    renderEndpoint = (key, endpoint) => (
        <div
            key={key}
            className={`
                ${styles.endpoint}
                ${this.state.expanded.indexOf(endpoint.title) === -1 ? '' : styles.expanded}
            `}
        >
            <h3>
                <button onClick={() => this.toggleExpand(endpoint)}>
                    {endpoint.title}
                </button>
            </h3>
            <ListView
                className={styles.methodsContainer}
                data={endpoint.methods}
                modifier={this.renderMethod}
                keySelector={this.calcMethodKey}
            />
        </div>
    )

    renderMethod = (key, method) => (
        <div
            key={key}
            className={styles.method}
        >
            <h4>
                {this.mapMethod(method.title)}
            </h4>
            <p className={styles.path}>
                {method.path}
            </p>
            {!isObjectEmpty(method.requestSchema) && (
                <div className={styles.schema}>
                    <h5>
                        {_ts('api', 'requestSchemaLabel')}
                    </h5>
                    {this.renderSchema(method.requestSchema)}
                </div>
            )}
            {!isObjectEmpty(method.responseSchema) && (
                <div className={styles.schema}>
                    <h5>
                        {_ts('api', 'responseSchemaLabel')}
                    </h5>
                    {this.renderSchema(method.responseSchema)}
                </div>
            )}
        </div>
    )

    renderSchema = schema => (
        <pre>
            {JSON.stringify(schema, null, 2)}
        </pre>
    )

    render() {
        const {
            pending,
            docs,
        } = this.state;

        return (
            <Page
                mainContentClassName={styles.apiDocs}
                mainContent={pending ? (
                    <p className={styles.message}>
                        {_ts('api', 'loadingLabel')}
                    </p>
                ) : (
                    this.renderDocs(docs)
                )}
            />
        );
    }
}
