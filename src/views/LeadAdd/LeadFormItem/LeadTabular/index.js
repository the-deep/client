import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';

import Button from '#rsca/Button';
import Wizard from '#rscv/Wizard';

import { iconNames } from '#constants';
import { leadPaneTypeMap, LEAD_PANE_TYPE } from '#entities/lead';
import { RequestClient, requestMethods } from '#request';
import _ts from '#ts';
import _cs from '#cs';

import FileTypeSelectionPage from './FileTypeSelectionPage';
import AttributesPage from './AttributesPage';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    mimeType: PropTypes.string,
    setTabularBook: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired,
    // lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // saveBookRequest: RequestClient.prop.isRequired,
    // metaRequest: RequestClient.prop.isRequired,
};

const defaultProps = {
    className: '',
    mimeType: '',
};

const requests = {
    saveBookRequest: {
        method: ({ params: { body } }) => (body.id ? requestMethods.PUT : requestMethods.POST),
        url: ({ params: { body } }) => (body.id ? `/tabular-books/${body.id}/` : '/tabular-books/'),
        body: ({ params: { body } }) => body,
        onSuccess: ({ props, params: { callback, body }, response }) => {
            if (!body.id) {
                callback(response.id);
            } else {
                props.setTabularBook(response.id);
            }
        },
    },
    metaRequest: {
        method: requestMethods.GET,
        url: ({ params: { bookId } }) => `/tabular-books/${bookId}/`,
        query: { fields: 'meta_status,meta' },
        options: {
            pollTime: 1200,
            maxPollAttempts: 100,
            shouldPoll: r => (
                r.metaStatus === 'pending' ||
                r.metaStatus === 'initial'
            ),
        },
        onSuccess: ({ response, params: { setMeta, setInvalid } }) => {
            if (response.metaStatus === 'success') {
                setMeta(response.meta);
            } else {
                setInvalid();
            }
        },
    },
};

@RequestClient(requests)
export default class LeadTabular extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calcFileType = (mimeType) => {
        const leadType = leadPaneTypeMap[mimeType];
        if (leadType === LEAD_PANE_TYPE.spreadsheet) {
            return 'xlsx';
        }
        return 'csv';
    };

    constructor(props) {
        super(props);

        this.state = {
            fileType: LeadTabular.calcFileType(props.mimeType),
            pending: false,
        };
    }

    handleFileTypeSet = (fileType) => {
        this.setState({ fileType });
    }

    /*
    handleFaramValidationSuccess = (book) => {
        const { faramValues: {
            title,
            attachment: file,
            url,
        } } = this.props.lead;
        const { bookId: id } = this.state;

        this.props.saveBookRequest.do({
            body: {
                ...book,
                id,
                title,
                file: file && file.id,
                url,
            },
            callback: this.handleTabularBook,
        });
    }

    handleTabularBook = (bookId) => {
        this.setState({ bookId }, () => {
            this.props.metaRequest.do({
                bookId,
                setMeta: meta => this.setState({ meta }),
                setInvalid: () => this.setState({ invalid: true }),
            });
        });
    }
    */

    render() {
        const {
            className,
            onCancel,
        } = this.props;
        const {
            bookId,
            fileType,
            pending,
        } = this.state;

        // TODO: handle pending separately
        // const pending = saveBookRequest.pending || metaRequest.pending;

        return (
            <div className={_cs(className, styles.leadTabular)}>
                <div className={styles.header}>
                    <Button
                        className={styles.backButton}
                        iconName={iconNames.close}
                        onClick={onCancel}
                        transparent
                    />
                    <h4 className={styles.title}>
                        {_ts('addLeads.tabular', 'title')}
                    </h4>
                </div>
                <div className={styles.content}>
                    {pending && <LoadingAnimation />}
                    <Wizard pending={pending}>
                        <FileTypeSelectionPage
                            fileType={fileType}
                            setFileType={this.handleFileTypeSet}
                        />
                        <AttributesPage
                            fileType={fileType}
                            bookId={bookId}
                        />
                    </Wizard>
                </div>
            </div>
        );
    }
}
