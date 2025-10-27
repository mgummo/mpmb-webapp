// define an interface for MorePurpleMoreBetter javascript files 

// functions from Lists.js
interface MpmbApp_Lists {

    // lists: Record<string, any>;

    // I think this is intended to be a lookup table, for the number of lines allowed for each field?
    FieldNumbers: Record<string, number>;

}

// functions from Functions0.js
interface MpmbApp_Functions0 {

    // sets the value of a pdf field
    Value(key: string, FldValue: unknown, tooltip?: string, submitNm?: string);

    // returns the value of a pdf field
    What(key: string)

    // todo: comment
    formatDescriptionFull: (description: string, bIgnoreUnicode: boolean) => string;
}

// functions from Functions1.js
interface MpmbApp_Function1 {

}

// functions from FunctionsResources.js
interface MpmbApp_FunctionsResources {

    // todo: clarify comment
    /**
     * a function to make a readable string of the rules source
     * 
     * @param obj 
     * @param verbosity
     * - full (full source name) 
     * - abbr (source abbreviation) 
     * - page (, page) 
     * - first (only first one found that is included)
     * - multi (add line break after each entry)
     * @param prefix 
     * @param suffix 
     * @returns 
     */
    stringSource: (obj: unknown, verbosity: string, prefix?: string, suffix?: string) => string;
}

interface AcrobatApp {
    getField: (name) => { name, value };
    getFields: () => { name, value }[];
}

interface MpmbApp extends
    Omit<MpmbApp_Lists, "FieldNumbers">,
    MpmbApp_Functions0,
    MpmbApp_Functions1,
    MpmbApp_FunctionsResources {
}

interface MpmbWrapper extends MpmbApp {

    lists: Record<string, any>;

    // not to be confused with AddWeapon from functions1.js, which does not do what I thought it did
    AddWeapon: (key: string, weapon: Partial<Weapon>) => void;

    UpdateWeapon: (key: string, weapon: Partial<Weapon>) => void;

}










