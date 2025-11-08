// define an interface for MorePurpleMoreBetter javascript files 

type MbamRegistry<TConfig, TDefinition> = Record<string, TDefinition> & {
    Add: (key: string, defintion: TConfig) => void;
}

// functions from Lists.js
interface MpmbApp_Lists {

    // lists: Record<string, any>;
    // AmmoList
    // ArmourList
    // BackgroundFeatureList
    // BackgroundSubList
    // ClassList
    // ClassSubList
    // CompanionList
    CreatureList: MbamRegistry<CreatureConfigDefinition, CreatureDefinition>
    // DefaultEvalsList
    // FeatsList
    // GearList
    // MagicItemsList
    // PacksList
    // PsionicList
    // RaceList
    // RaceSubList
    // SourceList
    SpellsList: Record<string, SpellDefinition>
    // ToolsList
    WeaponsList: Record<string, WeaponDefinition>
    // spellLevelList
    // spellSchoolList

    // I think this is intended to be a lookup table, for the number of lines allowed for each field?
    // FieldNumbers: Record<string, number>;

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
interface MpmbApp_Functions1 {

    // MakeDocName
    // MakeButtons
    // OpeningStatement
    // ResetTooltips
    // AddResistance
    // RemoveResistance
    // AddDmgType
    // ToggleWhiteout
    // ResetAll
    // ToggleTextSize
    // show3rdPageNotes
    // LayerVisibilityOptions
    // ToggleAttacks
    // ToggleBlueText
    // MakeAdventureLeagueMenu
    // AdventureLeagueOptions
    // ToggleAdventureLeague

    // todo: might want to pull these in?
    // ParseArmor
    // FindArmor
    // ApplyArmor
    // calcMaxDexToAC
    // calcCompMaxDexToAC
    // AddArmor
    // RemoveArmor
    // FindShield
    // ApplyShield

    // ConditionSet
    // classesFieldVal

    // parses the given text as a class and subclass
    // returns the keys to that class and subclass
    ParseClass: (input: string) => [mainclass: string, subclass: string] | false

    // FindClasses

    // maybe pull this in?
    // ApplyClasses
    // SetClassHD

    // ClassMenuVisibility
    // ApplyClassLevel
    // levelFieldVal
    // getCurrentLevelByXP
    // CalcExperienceLevel
    // AddExperiencePoints

    // pull this in?
    // ParseRace

    // FindRace
    // ApplyRace
    // AmendOldToNewRace
    // ParseWeapon
    // FindWeapons
    // ReCalcWeapons
    // SetWeaponsdropdown
    // SetArmordropdown
    // SetBackgrounddropdown
    // SetRacesdropdown
    // getMenu
    // RememberGearTempOnFocus
    // SetGearWeightOnBlur
    // ParseGear
    // AddToInv
    // SetGearVariables
    // SetEquipmentMenuTooltip
    // MakeInventoryMenu
    // InventoryOptions
    // AddInvStartingItems
    // AddInvArmorShield
    // AddInvWeaponsAmmo
    // MakeInventoryLineMenu
    // InventoryLineOptions
    // InvInsert
    // InvDelete

    // pull this in?
    // ParseBackground

    // FindBackground
    // ApplyBackground
    // MakeBackgroundMenu_BackgroundOptions
    // AddLangTool
    // RemoveLangTool
    // AddWeapon
    // RemoveWeapon
    // AddString
    // RemoveString
    // ReplaceString
    // AddSkillProf

    // todo: continue skimming at this point

    //change all the level-variables gained from classes and races
    UpdateLevelFeatures(Typeswitch, newLvlForce)


    // Calculate the AC (field calculation)
    CalcAC()

    CalcAllSkills: (isCompPage: boolean) => void


    // 
    // SetTheAbilitySaveDCs
}

interface MpmbApp_Functions3 {

    /*
        A function to handle all the common attributes a feature can have
        Input:
            type - the type of thing being processed
                STRING "class", "race", "feat", or "item"
            fObjName - the object name; array only for class/race with features
                if type="feat" or type="item":
                    STRING
                if type="class" or type="race":
                    ARRAY [STRING: class/race-name, STRING: feature-name]
                    // for a race, if the feature-name is also the race-name, the parent race object will be used
            lvlA - old and new level and a true/false to force updating regardless of old-level
                ARRAY [INTEGER: old-level, INTEGER: new-level, BOOLEAN: force-apply]
            choiceA - child object names of overriding choice
                ARRAY [STRING: old-choice, STRING: new-choice, STRING: "only","change"]
                // if 'only-choice' is set to true, it is viewed as an extra-choice and just the child features will be used (e.g. Warlock Invocations)
            forceNonCurrent - the parent object name if the sheet is to use the original list object and not the CurrentXXX (CurrentRace, CurrentClasses)
                STRING
        Examples:
            ApplyFeatureAttributes("feat", "grappler", [0,1,false], false, false);
            ApplyFeatureAttributes("class", ["warlock","pact boon"], [4,4,true], ["pact of the blade","pact of the chain","change"], false); // change from Pact of the Blade to Pact of the Chain
            ApplyFeatureAttributes("class", ["warlock","eldritch invocations"], [0,4,true], ["","devil's sight","only"], false); // add Devil's Sight
            ApplyFeatureAttributes("class", ["warlock","eldritch invocations"], [15,0,true], ["devil's sight","","only"], false); // remove Devil's Sight
    */
    // function ApplyFeatureAttributes(type, fObjName, lvlA, choiceA, forceNonCurrent) {

    // a function to apply the first-level attributes of a class object
    // AddRemove - can be boolean (true = add all feature, false = remove all features)
    //		or can be an Array of [oldsubclass, newsubclass]
    // function ApplyClassBaseAttributes(AddRemove, aClass, primaryClass) {
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

    lists: MpmbApp_Lists


    // not to be confused with AddWeapon from functions1.js, which does not do what I thought it did
    // todo: annotate Add / Update methods on lists

}










