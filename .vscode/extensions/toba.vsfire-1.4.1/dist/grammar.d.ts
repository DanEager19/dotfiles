/**
 * Basic information about a symbol, whether type, method, directive or access
 * modifier.
 */
export interface SymbolInfo {
    about: string;
}
/**
 * Data request method
 * @see https://cloud.google.com/firestore/docs/reference/security/#request_methods
 */
export interface AllowInfo extends SymbolInfo {
    name: string;
    /** Key list converted to object map during compile. */
    includeTypes?: string[];
    includes?: AllowInfo[];
}
export interface TypeInfo extends SymbolInfo {
    methods?: {
        [key: string]: MethodInfo;
    };
    fields?: {
        [key: string]: TypeInfo;
    };
    /**
     * Assigning a `basicType` will attach that types fields and methods to this
     * type.
     */
    basicType?: string;
}
export interface MethodInfo extends SymbolInfo {
    parameters?: string[];
    returns?: string;
    /**
     * Snippets are generated during compile if `parameters` have been defined.
     * @see https://code.visualstudio.com/docs/editor/userdefinedsnippets
     */
    snippet?: string;
}
/**
 * Find type information with given short or fully-qualified name.
 */
export declare function findType(name: string): Promise<TypeInfo | null>;
/**
 * Find any named symbol whether a type, method or access modifier.
 */
export declare function findAny(name: string): Promise<SymbolInfo | null>;
/**
 * Get named access modifiers.
 */
export declare function accessModifiers(): Promise<AllowInfo[]>;
/**
 * Compile heirarchical grammar into flat map for faster lookup. If already
 * compiled then promise resolves immediately. Otherwise the resolver is added
 * to any prior resolvers (listeners) awaiting compilation.
 */
export declare function compile(force?: boolean): Promise<void>;
