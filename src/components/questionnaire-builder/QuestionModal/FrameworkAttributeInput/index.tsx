import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import SegmentInput from '#rsci/SegmentInput';
import SelectInput from '#rsci/SelectInput';
import {
    QuestionElementFrameworkAttribute,
    Matrix2dFlatSectorElement,
    Matrix2dFlatSubsectorElement,
    Matrix2dFlatDimensionElement,
    Matrix2dFlatSubdimensionElement,
    Matrix2dFlatCellElement,
} from '#types';

import {
    frameworkAttributeTypeOptionList,
    defaultKeySelector,
    defaultLabelSelector,
} from '#constants/dummy';

import styles from './styles.scss';

interface Props {
    className?: string;
    value?: QuestionElementFrameworkAttribute;
    onChange: (newValue: QuestionElementFrameworkAttribute) => void;

    sectorList: Matrix2dFlatSectorElement[];
    subsectorList: Matrix2dFlatSubsectorElement[];
    dimensionList: Matrix2dFlatDimensionElement[];
    subdimensionList: Matrix2dFlatSubdimensionElement[];
}

const keySelector = (d: Matrix2dFlatCellElement) => d.id;

const labelSelector = (d: Matrix2dFlatCellElement) => d.title;

class FrameworkAttributeInput extends React.PureComponent<Props> {
    private getInputValues = memoize((value: QuestionElementFrameworkAttribute | undefined) => {
        if (!value) {
            return {};
        }

        const {
            type,
            value: attributeValue,
            parentValue,
        } = value;

        const attributeTypeMap = {
            sector: 'sector',
            subsector: 'sector',
            dimension: 'dimension',
            subdimension: 'dimension',
        };

        return {
            typeValue: attributeTypeMap[type],
            sectorValue: (type === 'sector' || type === 'subsector')
                ? (parentValue || attributeValue)
                : undefined,
            subsectorValue: (type === 'subsector') ? attributeValue : undefined,
            dimensionValue: (type === 'dimension' || type === 'subdimension')
                ? (parentValue || attributeValue)
                : undefined,
            subdimensionValue: (type === 'subdimension') ? attributeValue : undefined,
        };
    })

    private handleTypeInputChange = (type: QuestionElementFrameworkAttribute['type']) => {
        const { onChange } = this.props;

        onChange({
            type,
        });
    }

    private handleSectorInputChange = (sectorId: Matrix2dFlatCellElement['id']) => {
        const {
            onChange,
            sectorList,
        } = this.props;

        const sector = sectorList.find(d => d.id === sectorId);

        if (sector) {
            onChange({
                type: 'sector',
                matrix2dId: sector.matrix2dId,
                value: sector.id,
            });
        }
    }

    private handleSubsectorInputChange = (subsectorId: Matrix2dFlatCellElement['id']) => {
        const {
            onChange,
            subsectorList,
        } = this.props;

        const subsector = subsectorList.find(d => d.id === subsectorId);

        if (subsector) {
            onChange({
                matrix2dId: subsector.matrix2dId,
                parentValue: subsector.sectorId,
                type: 'subsector',
                value: subsector.id,
            });
        }
    }

    private handleDimensionInputChange = (dimensionId: Matrix2dFlatCellElement['id']) => {
        const {
            onChange,
            dimensionList,
        } = this.props;

        const dimension = dimensionList.find(d => d.id === dimensionId);

        if (dimension) {
            onChange({
                matrix2dId: dimension.matrix2dId,
                type: 'dimension',
                value: dimension.id,
            });
        }
    }

    private handleSubdimensionInputChange = (subdimensionId: Matrix2dFlatCellElement['id']) => {
        const {
            onChange,
            subdimensionList,
        } = this.props;

        const subdimension = subdimensionList.find(d => d.id === subdimensionId);

        if (subdimension) {
            onChange({
                matrix2dId: subdimension.matrix2dId,
                type: 'subdimension',
                value: subdimension.id,
                parentValue: subdimension.dimensionId,
            });
        }
    }

    public render() {
        const {
            className,
            value,
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = this.props;

        const {
            typeValue,
            sectorValue,
            subsectorValue,
            dimensionValue,
            subdimensionValue,
        } = this.getInputValues(value);

        const filteredSubsectorList = subsectorList.filter(ss => ss.sectorId === sectorValue);
        const filteredSubdimensionList = subdimensionList
            .filter(ss => ss.dimensionId === dimensionValue);

        return (
            <div className={_cs(styles.frameworkAttributeInput, className)}>
                <SegmentInput
                    // FIXME: use strings
                    label="Attribute type"
                    options={frameworkAttributeTypeOptionList}
                    keySelector={defaultKeySelector}
                    labelSelector={defaultLabelSelector}
                    value={typeValue}
                    onChange={this.handleTypeInputChange}
                    className={styles.input}
                    showHintAndError={false}
                />
                {typeValue === 'sector' && (
                    <div className={styles.sectorInputContainer}>
                        <SelectInput
                            className={styles.input}
                            onChange={this.handleSectorInputChange}
                            options={sectorList}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            // FIXME: use strings
                            label="Sector"
                            value={sectorValue}
                            showHintAndError={false}
                        />
                        <SelectInput
                            className={styles.input}
                            onChange={this.handleSubsectorInputChange}
                            options={filteredSubsectorList}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            // FIXME: use strings
                            label="Subsector"
                            value={subsectorValue}
                            showHintAndError={false}
                        />
                    </div>
                )}
                {typeValue === 'dimension' && (
                    <div className={styles.dimensionInputContainer}>
                        <SelectInput
                            className={styles.input}
                            onChange={this.handleDimensionInputChange}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            options={dimensionList}
                            // FIXME: use strings
                            label="Dimension"
                            value={dimensionValue}
                            showHintAndError={false}
                        />
                        <SelectInput
                            className={styles.input}
                            onChange={this.handleSubdimensionInputChange}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            options={filteredSubdimensionList}
                            // FIXME: use strings
                            label="Subdimension"
                            value={subdimensionValue}
                            showHintAndError={false}
                        />
                    </div>
                )}
            </div>
        );
    }
}

export default FaramInputElement(FrameworkAttributeInput);
