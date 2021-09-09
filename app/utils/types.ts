// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export type DeepMandatory<T, K extends keyof any> = T extends object ? (
    T extends (infer I)[] ? (
        DeepMandatory<I, K>[]
    ) : (
        ({ [P1 in (Extract<keyof T, K>)]-?: NonNullable<T[P1]> } &
         { [P2 in keyof Pick<T, Exclude<keyof T, K>>]: DeepMandatory<T[P2], K> })
    )
) : T

export type DeepReplace<T, A, B> = (
    T extends A
        ? B
        : (
            T extends (infer Z)[]
                ? DeepReplace<Z, A, B>[]
                : (
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    T extends object
                        ? { [K in keyof T]: DeepReplace<T[K], A, B> }
                        : T
                )
        )
)
