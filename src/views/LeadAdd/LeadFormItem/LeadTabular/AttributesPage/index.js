import PropTypes from 'prop-types';
import React from 'react';

import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import Faram, {
    requiredCondition,
    greaterThanCondition,
} from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import NonFieldErrors from '#rsci/NonFieldErrors';

import { listToMap } from '#rsu/common';

import { RequestClient, requestMethods } from '#request';

import _ts from '#ts';

import CsvSettings from './CsvSettings';
import ExcelSettings from './ExcelSettings';
import styles from './styles.scss';


const propTypes = {
    onPrev: PropTypes.func,
    onCancel: PropTypes.func,
    defaultFileType: PropTypes.string,
    metaInfo: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    createBookRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    onPrev: () => {},
    onCancel: () => {},
    defaultFileType: undefined,
};

const requests = {
    createBookRequest: {
        method: requestMethods.POST,
        url: '/tabular-books/',
        body: ({ params: { body } }) => body,
        onSuccess: ({ props, response }) => {
            props.onComplete(response.id);
        },
        onFailure: ({ error: { faramErrors }, params: { handleFaramError } }) => {
            handleFaramError(faramErrors);
        },
        onFatal: ({ params: { handleFaramError } }) => {
            handleFaramError({
                $internal: ['SERVER ERROR'],
            });
        },
    },
};

@RequestClient(requests)
export default class AttributesPage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        // Initialize faram data
        const {
            metaInfo: meta = {},
            defaultFileType: fileType,
            lead: {
                faramValues: {
                    title,
                    project,
                    attachment,
                },
            },
        } = this.props;

        let faramValues = {
            title,
            project,
            file: attachment.id,
            fileType,
        };

        let schema;
        if (fileType === 'csv') {
            schema = {
                fields: {
                    options: {
                        fields: {
                            delimiter: [requiredCondition],
                            noHeaders: [],
                        },
                    },
                    fileType: [],
                    title: [],
                    file: [],
                    project: [],
                },
            };

            faramValues = {
                ...faramValues,
                options: {
                    delimiter: ',',
                },
            };
        } else if (fileType === 'xlsx') {
            const { sheets = [] } = meta;

            const xlsxSchema = listToMap(
                sheets,
                sheet => sheet.key,
                () => ({
                    identifier: (val = {}) => (val.skip ? 'skipped' : 'default'),
                    fields: {
                        skipped: {
                            skip: [],
                        },
                        default: {
                            skip: [],
                            headerRow: [requiredCondition, greaterThanCondition(0)],
                            noHeaders: [],
                        },
                    },
                }),
            );

            schema = {
                validation: (value = {}) => {
                    const errors = [];
                    const {
                        options: {
                            sheets: sheetsValue = {},
                        } = {},
                    } = value;
                    const hasAllSkipped = Object.keys(sheetsValue)
                        .every(key => sheetsValue[key].skip);
                    if (hasAllSkipped) {
                        errors.push('All sheets cannot be skipped');
                    }
                    return errors;
                },
                fields: {
                    options: {
                        fields: {
                            sheets: {
                                fields: xlsxSchema,
                            },
                        },
                    },
                    title: [],
                    fileType: [],
                    file: [],
                    project: [],
                },
            };

            faramValues = {
                ...faramValues,
                options: {
                    sheets: listToMap(
                        sheets,
                        sheet => sheet.key,
                        () => ({
                            headerRow: 1,
                        }),
                    ),
                },
            };
        }

        this.state = {
            fileType,
            meta,
            schema,
            faramValues,
            faramErrors: {},
        };
    }

    handleBackClick = () => {
        this.props.onPrev();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFaramValidationSuccess = (faramValues) => {
        this.props.createBookRequest.do({
            body: faramValues,
            handleFaramError: this.handleFaramValidationFailure,
        });
    }

    render() {
        const {
            fileType,
            meta,
            schema,
            faramValues,
            faramErrors,
        } = this.state;
        const {
            createBookRequest,
            onCancel,
        } = this.props;

        const { pending: savePending } = createBookRequest;

        // NOTE: Default component should be null but FaramGroup doesn't
        // support null child yet.
        const component = (
            (fileType === 'csv' && <CsvSettings />) ||
            (fileType === 'xlsx' && <ExcelSettings meta={meta} />)
        );

        return (
            <Faram
                key={fileType}
                className={styles.form}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
                disabled={savePending}
            >
                <ModalBody>
                    <NonFieldErrors faramElement />
                    { component &&
                        <FaramGroup faramElementName="options">
                            {component}
                        </FaramGroup>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleBackClick}>
                        {_ts('addLeads.tabular', 'backButtonTitle')}
                    </Button>
                    <DangerButton onClick={onCancel}>
                        {_ts('addLeads.tabular', 'cancelButtonTitle')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        pending={savePending}
                    >
                        {_ts('addLeads.tabular', 'extractButtonTitle')}
                    </PrimaryButton>
                </ModalFooter>
            </Faram>
        );
    }
}
