declare module '@togglecorp/faram' {
    import * as React from 'react';

    interface ObjectSchemaWithIdentifier {
        identifier: (value: Record<string, unknown>) => string;
        fields: {
            [key: string]: {
                [key: string]: unknown[] | ArraySchema | ObjectSchema | ObjectSchemaWithIdentifier;
            };
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validation?: (value: any) => string[];
    }
    interface ObjectSchema {
        fields: {
            [key: string]: unknown[] | ArraySchema | ObjectSchema | ObjectSchemaWithIdentifier;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validation?: (value: any) => string[];
    }
    export interface ArraySchema {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validation?: (value: any) => string[];
        member: ObjectSchema | ObjectSchemaWithIdentifier;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        keySelector: (value: any) => string | number;
    }
    export type Schema = ObjectSchema | ObjectSchemaWithIdentifier;

    interface ObjectComputeSchema {
        fields: {
            [key: string]: ArrayComputeSchema
            | ObjectComputeSchema
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            | ((attr: any, w: any, d: any, v?: any) => any);
        };
    }
    interface ArrayComputeSchema {
        member: ObjectComputeSchema;
    }
    export type ComputeSchema = ObjectComputeSchema;

    const test: ComputeSchema = {
        fields: {
            data: {
                fields: {
                    value: () => {},
                },
            },
        },
    };

    interface FaramProps {
        className?: string;
        schema: Schema;
        computeSchema?: ComputeSchema;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange: (faramValues: any, faramErrors: any) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValidationSuccess?: (faramValues: any, faramValues: any) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValidationFailure?: (faramErrors: any) => void;
        disabled?: boolean;
    }

    export default class Faram extends React.PureComponent<FaramProps> {
    }

    export function detachedFaram(args: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any;
        schema: Schema;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValidationSuccess?: (faramValues: any, faramValues: any) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onValidationFailure?: (faramErrors: any) => void;
    }): void;

    export function FaramList(props: {
        faramElementName: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        keySelector: (item: any) => string | number;
        children: React.ReactNode | null;
    });

    export function FaramGroup(props: {
        faramElementName: string;
        children: React.ReactNode | null;
    });


    interface ValidOp {
        ok: boolean;
        mesage?: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const exclusiveInBetweenCondition: (min: number, max: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const inclusiveInBetweenCondition: (min: number, max: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const lessThanCondition: (n: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const greaterThanCondition: (n: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const lessThanOrEqualToCondition: (n: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const greaterThanOrEqualToCondition: (n: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const lengthLessThanCondition: (n: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const lengthGreaterThanCondition: (n: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const lengthEqualToCondition: (n: number) => (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const requiredCondition: (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const numberCondition: (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const integerCondition: (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const emailCondition: (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const urlCondition: (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const lenientUrlCondition: (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const dateCondition: (value: any) => ValidOp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const timeCondition: (value: any) => ValidOp;

    function FaramInputElement<T>(component: React.ComponentType<T>):
        React.ComponentType<
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Omit<T, 'value' | 'onChange'> & { faramElementName: string; faramInfo?: any })
            | (T & { faramElementName?: undefined })
        >;

    function FaramActionElement<T>(component: React.ComponentType<T>):
        React.ComponentType<
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Omit<T, 'disabled' | 'changeDelay' | 'onClick'> & { faramElementName: string; faramAction: any })
            | (T & { faramElementName?: undefined })
        >;
    /*
    // NOTE: you need to explicitly pass faramElementName with this typing

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramOutputElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'value'> & { faramElementName: string }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramErrorMessageElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'errors'> & { faramElement: boolean }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramErrorIndicatorElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'hasError' | 'errors'> & { faramElementName: string }>


    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramListElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'data' | 'keySelector'> & { faramElement: boolean }>

    // NOTE: you need to explicitly pass faramElementName with this typing
    function FaramSortableListElement<T>(component: React.ComponentType<T>):
        React.ComponentType<Omit<T, 'data' | 'onChange' | 'keySelector'>
            & { faramElement: boolean }>
    */
}
