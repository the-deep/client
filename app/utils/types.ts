// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeepMandatory<T, K extends keyof any> = T extends object ? (
    T extends (infer I)[] ? (
        DeepMandatory<I, K>[]
    ) : (
        ({ [P1 in (Extract<keyof T, K>)]-?: NonNullable<T[P1]> } &
         { [P2 in keyof Pick<T, Exclude<keyof T, K>>]: DeepMandatory<T[P2], K> })
    )
) : T

type DeepNonNullable<T> = T extends object ? (
    T extends (infer K)[] ? (
        DeepNonNullable<K>[]
    ) : (
        { [P in keyof T]-?: DeepNonNullable<T[P]> }
    )
) : NonNullable<T>;

export type DeepReplace<T, A, B> = (
    DeepNonNullable<T> extends DeepNonNullable<A>
        ? B
        : (
            T extends (infer Z)[]
                ? DeepReplace<Z, A, B>[]
                : (
                    T extends object
                        ? { [K in keyof T]: DeepReplace<T[K], A, B> }
                        : T
                )
        )
)

type Check<T> = T extends string[] ? string[] : T extends string ? string : undefined;

export type EnumFix<T, F> = T extends object[] ? (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends any[] ? EnumFix<T[number], F>[] : T
) : ({
    [K in keyof T]: K extends F ? Check<T[K]> : EnumFix<T[K], F>;
})

export type getType<T, Q> = T extends Q ? T : never;
