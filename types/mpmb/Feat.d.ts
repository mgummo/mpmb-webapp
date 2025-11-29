/**
        Common usage examples:
            "return CurrentRace.known.indexOf('dwarf') !== -1;" // Test if race is a dwarf
            "return classes.known.cleric ? true : false;" // Test if character has any levels in the cleric class
            "return What('Dex') >= 13;" // Test if character has a Dexterity score of 13 or more
        @example 
        function (v) {
            return v.isSpellcaster && CurrentRace.known.indexOf('dwarf') !== -1;
        }
        @example
        "CurrentSpells.toSource() !== '({})' && CurrentRace.known.indexOf('dwarf') !== -1"
 */
type PreReqContext = {

    isSpellcaster,  	// boolean; true if the character has spellcasting from a source other than magic items
    isSpellcastingClass,// boolean; true if the character has spell slots from a class (i.e. the Spellcasting or Pact Magic feature)
    characterLevel, 	// number; the total character level
    shieldProf,     	// boolean; true if the checkbox for shield proficiency is checked
    lightArmorProf, 	// boolean; true if the checkbox for light armour proficiency is checked
    mediumArmorProf,	// boolean; true if the checkbox for medium armour proficiency is checked
    heavyArmorProf, 	// boolean; true if the checkbox for heavy armour proficiency is checked
    simpleWeaponsProf,	// boolean; true if the checkbox for simple weapon proficiency is checked
    martialWeaponsProf,	// boolean; true if the checkbox for martial weapon proficiency is checked
    otherWeaponsProf,	// array; the WeaponsList object names of those listed in the other weapon proficiencies field (or the literal string if not a recognized weapon)
    toolProfs,   		// array; the contents of the tool fields, one field per array entry
    toolProfsLC,   		// array; same as toolProfs, but all lowercase
    languageProfs,   	// array; the contents of the language fields, one field per array entry
    languageProfsLC,   	// array; same as languageProfs, but all lowercase
    skillProfs,     	// array; the skills the character is proficient in, one skill name per array entry
    skillProfsLC,   	// array; same as skillProfs, but all lowercase
    skillExpertise,     // array; the skills the character has expertise with, one skill name per array entry
    skillExpertiseLC,   // array; same as skillExpertise, but all lowercase
    hasEldritchBlast,	// boolean; true if the character has the Eldritch Blast cantrips
    choice,      		// string; the sub-choice of this feat (empty string if no choice)

    // N.B. The first entry of both the toolProfs and languageProfs arrays is the contents of the 'More Proficiency' field
}

type Mpmb_FeatBase = {

    /**
     * name of the feat as it will be used by the sheet
     * 
     * @remarks
     * This name will also be used to recognize what is selected in the feat drop-down.
     * @example "Purple Power"
     */
    name: string;

    /**
     * name of the feat as it will be shown in the menu for selecting feats
     * 
     * @remarks
    This name will only be used to display the feat in the menu.
    This attribute is not used to recognize the feats or fill the field on the sheet.
 
    FIGHTING STYLES
    if the `type` attribute is set to "fighting style" (see `type` below), then this
    `sortname` is also used to populate the `choices` array.
    Practically this means that the menu displayed when pushing the "Choose Feature" button
    will show the `sortname` instead of the `name`;
    *
    * @since v24.0.0
    * @example "Power, Purple"
    */
    sortname?: string;

    /**
     * Which source book(s) the creature is defined.
     */
    source: SourceList;

    /** 
     * define which type of feat this is
     * 
     * @remarks
        This attribute is used to sort the feats in the drop-down, to populate the feat's tooltip,
        and it is used by the `featsAdd` common attribute (see "_common attributes.js").
    
        The `featsAdd` attribute can offer the player a choice of feats that have a certain `type`.
        If the provided `type` in the `featsAdd` attribute is (case-insensitive) included in this
        `type` attribute string, then the feat will be shown in the options.
    
        Common feat types are:
            "origin"
            "general"
            "fighting style"
            "epic boon"
            "supernatural gift"
    
        You can also define a custom type, or even a subtype.
        For example, "origin (dwarf)" would have the feat appear both when `featsAdd.type` is
        set to `type: "origin"` and `type: "origin (dwarf)"`.
    
        FIGHTING STYLES
        If you set this attribute to "fighting style", the feat will be added as a choice to any
        class feature with the `choicesFightingStyles` attribute.
    
        This choice will use all the attributes of this feat, but will ignore incompatible ones:
            INCOMPATIBLE		REMARK
            `calculate` 		Only uses `description` (or `descriptionClassFeature`)
            `defaultExcluded`	Exclusion will be based on source only
            `descriptionFull`	No spot for this to render
            `choices`   		Class Features don't support sub-choices
            `allowDuplicates`	Class features choices only offer a single selection
    
        You don't need to provide a `prerequisite` or `prereqeval`, those will be handled
        automatically for both the feat selection and the class feature choice.
        The feat will automatically require "Fighting Style Feature".
        If you do set a `prerequisite` or `prereqeval`, that will override the automation.
    
        Regardless of the `prerequisite` or `prereqeval`, the sheet won't allow selecting a
        `type: "fighting style"` feat if that Fighting Style is already selected by other means.
    
        If the description in the Class Features field should be different than the `description`,
        set the `descriptionClassFeature` attribute (see below).
        Otherwise the `description`, prefixed with a line break, will be used.
        @example "origin"
        @since v24.0.0
    */
    type: string;

    /**
     * whether this feat should be excluded by default (true) or included by default (false)
     * 
     * @remarks
        Include this attribute and set it to true if the feat should appear in the Excluded list of the
        Source Selection Dialog when the script is added for the first time.
        It will have to be manually set to be included before it is used by the sheet's automation.
        The user will be made aware of this exclusion.
    
        This is useful for optional feats that you wouldn't normally want to use (e.g. playtest or campaign-specific).
    
        @defaultValue false
        @example true
    */
    defaultExcluded?: boolean;

    /**
     * textual explanation of a prerequisite the feat has
     * 
     * @remarks
     * If the feat doesn't have a prerequisite, you can just leave this attribute out.
     * @example "Dexterity 13 or higher",
    */
    prerequisite?: string;

    /**
     * Function that returns 'true' if the prerequisite is met or 'false' otherwise
     * 
     * @remarks     
        The first two examples do the same thing - one demonstrates the function syntax, and one demonstrates the string syntax.
        Writing a function is better as it is easier to avoid syntax errors and will run faster.
        The string option is there for backwards-compatibility and this explanation assumes you are writing a function.
     
        The function is fed one variable, v, an object containing attributes with information about the character.
        Changing these attributes does nothing, but you can use them to test if the character meets the requirements.
           
        @example
        function (v) {
            return v.isSpellcaster && CurrentRace.known.indexOf('dwarf') !== -1;
        }
        @example "CurrentSpells.toSource() !== '({})' && CurrentRace.known.indexOf('dwarf') !== -1"
        @example "return CurrentRace.known.indexOf('dwarf') !== -1;" // Test if race is a dwarf
        @example "return classes.known.cleric ? true : false;" // Test if character has any levels in the cleric class
        @example "return What('Dex') >= 13;" // Test if character has a Dexterity score of 13 or more
    */
    prereqeval?: ((context: PreReqContext) => boolean) | string;

    /** set to true if multiples can exist of this feat (e.g. Elemental Adept using the 'choices' attribute)
     * 
     * @remarks
    If the feat doesn't allow duplicates, you can just leave this attribute out.
 
    IMPORTANT NOTE IF USING 'choices' ATTRIBUTE
    When this feat has multiple forms and uses the 'choices' attribute,
    you probably want to set the 'allowDuplicates' attribute to true.
    If you don't set this attribute to true, the sheet will only allow this feat to exist once,
    regardless if another instance has another form (choices) selected.
 
    FIGHTING STYLES
    if the `type` attribute is set to "fighting style" (see `type` above), then this
    `allowDuplicates` attribute is ignored.
    Fighting styles always only allow a single instance to exist.

    @defaultValue false
    @example true
    @since v24.0.0 (`type: "fighting style"` feats ignore this attribute)
    */
    allowDuplicates?: boolean

    /** 
     * the text to be filled in the description field of the feat
 
    Note that the sheet normally uses the first person for this.
    Make sure that this description is not too long and fits in the description field.
    The Printer Friendly sheets have less space for feat descriptions than the Colourful
    versions, so use the Printer Friendly sheets to test if the description fits.
  
    Be aware that the default font on the Colourful sheets is already italic,
    so making something only italic won't be visible on the Colourful sheets.
    @example "Advantage on Charisma (Deception) and (Performance) if wearing something purple. I can mimic casting any spell perfectly, even producing a purple haze while doing so. Wisdom (Insight) vs. Charisma (Deception) to determine there is no spell being cast. [+1 Charisma]",
    @since v14.0.0 (formatting characters)
    */
    description: rich_text

    /**	descriptionClassFeature // OPTIONAL //
    TYPE:	string
    USE:	the text to be filled in the Class Features field of the Fighting Style feat
    ADDED:	v24.0.0
    
    This attribute is only applicable if the `type` attribute is set to "fighting style",
    see `type` above.
    If this attribute is set, it is used instead of the `description` when adding this
    Fighting Style as a class feature choice in the Class Features field.
    
    This attribute is used as-is, without prefixing a line break.
    
    Note that the sheet normally uses the first person for this.
    Make sure that it is not too long and fits well in the Class Feature field.
    The Colourful sheets have less space than the Printer Friendly versions,
    so use the Colourful sheets to test if the description fits.
    */
    descriptionClassFeature: "I treat 1 or 2 on damage as 3 for Two-Handed/Versatile Melee weapons held with 2 hands.",

    /**
     * description of the feat as it appears in its source
     * 
     * @remarks
        This text is used to populate the tooltip of the feats so that the original description can be read.
        This description will also be available in a pop-up by using the button in the feat's line.
        There is no limit to how big this description can be,
        but very long descriptions will not always display correctly.
    
        ARRAY (since v14.0.0)
        This attribute can be an array. Each entry in the array will be put
        on a new line. Each entry can be one of the following:
            1. String
               If the entry is a string that doesn't start with a space character and
               it is not the first entry, it will be added on a new line proceeded by
               three spaces (i.e. `\n   `).
               If the entry is a string that starts with a space character,
               it will be added on a new line without any preceding spaces.
               For example, to make a bullet point list, you would use ` \u2022 list entry`
               (N.B. `\u2022` is unicode for a bullet point).
            2. Array of arrays, which contain only strings
               If the entry is in itself an array, it is treated as a table.
               Each entry in that array is a row in the table, with the first row being the headers.
               The headers will be made bold with the `**` formatting character, see below.
               Each subarray is rendered with a tab between each column (i.e. `Array.join("\t")`).
               If instead of a subarray there is a string, it will be added as is.
               The table will be preceded by two line breaks and followed by one line break.
    
        FORMATTING CHARACTERS (since v14.0.0)
        Regardless if you use a string or an array, the `descriptionFull` can be formatted
        using the Rich Text formatting characters, see the `description` attribute above.
    
        By default, the `descriptionFull` is only used to populate the tooltip and pop-up
        dialogs, which don't support formatting except through unicode.
        This means that only the bold and italic formatting will have any effect.
        Other formatting characters will be ignored (e.g. no underlining or strikethrough).
        If unicode is disabled, the sheet will instead capitalize everything between any
        formatting characters (including the `_` and `~` characters).
    
        The full range of formatting options will only be applicable if the `descriptionFull`
        is used in a field on the sheet.
        This can happen if the feat has the `toNotesPage` attribute with
        `useFullDescription: true`, for example.
    @since v14.0.0 (array option & formatting tags)
    @example "I gain proficiency in any combination of three skills or tools of my choice."
    @example [
        "Introduction text of the feat. This will not be preceded by a line break or three spaces as this is the first paragraph.",
        "Second entry, which will be preceded by a line break and three spaces.",
        " \u2022 Bullet point entry. This will be preceded by a line break, but not with three spaces, as this entry starts with a space.",
        " \u2022 Another bullet point entry.",
        [ // This will render as a table (i.e. a tab between each column)
            ["Column 1 header", "Column 2 header", "Column 3 header"], // The first row, which will be made bold
            ["Column 1 entry", "Column 2 entry", "Column 3 entry"], // The rest of the rows won't be changed
            ["Column 1 entry II", "Column 2 entry II", "Column 3 entry II"], // Table row 2
        ],
        "***Header Paragraph***. This paragraph will be preceded by a line break and three spaces. The text 'Header Paragraph' will be rendered with unicode as being bold and italic because of the three asterisks around it.",
    ]
    */
    descriptionFull?: string | string[]

    calculate: "event.value = \"I can spend 10 minutes inspiring up to 6 friendly creatures within 30 feet who can see or hear and can understand me. Each gains lvl (\" + What(\"Character Level\") + \") + Cha mod (\" + What(\"Cha Mod\") + \") temporary hit points. One can't gain temporary hit points from this feat again until after a short rest.\";",
    /*	calculate // OPTIONAL //
        TYPE:	string
        USE:	this string is set as the field calculation method for the description field of the feat
        CHANGE: v14.0.0 (formatting characters)
    
        The string is evaluated as JavaScript code whenever anything changes on the sheet.
        To change the value of the field, you will have to set the 'event.value' to something.
        The example above sets the field to a text with calculated numbers in the text,
        the character level and Charisma Modifier.
    
        If this attribute is present, the 'description' attribute will be useless.
        Remember that the 'description' attribute is still required, so you might just want to set it to an empty string:
            description: "",
    
        FORMATTING CHARACTERS (since v14.0.0)
        The resulting string can be formatted using the Rich Text formatting characters.
        See the `description` attribute above for an explanation of how they work.
    */
} & CommonAttributes

/*
     >>>>>>>>>>>>>>>>>>>>>>>
     >>> Composite Feats >>>
     >>>>>>>>>>>>>>>>>>>>>>>
 
     The next part is about the use of the 'choices' attribute, which is optional.
     The 'choices' attribute will allow the feat to have a subset of options.
     The player will be forced to select one of those options, the feat will not be usable without a selection.
 
     To set up a choice, add the 'choices' attribute, see below, and add an object for each of those choices.
     The object name has to be exactly the same as the string in the 'choices' array, but need to be all lowercase.
 */
type Mpmb_CompositeFeat = Mpmb_FeatBase & {

    choices: ['Fire', 'Ice'],
    /*	choices // OPTIONAL //
        TYPE:	array (variable length)
        USE:	options for the feat
    
        The text in the array is presented to the player as options to choose from for what form of the feat to use.
        The order of this array is used exactly as you write it.
        If you include this attribute, an option will have to be chosen.
    
        You will have to make a 'choice' object for each item you include in this array.
        To make a choice object, use the exact name of the entry in this array, but lowercase.
        See the below example "fire" for more information.
    */

    /**
     * select the 'choice' automatically when the feat is added
     * 
     * @remarks
        If the feat has the 'choices' attribute, the function in this attribute will be run
        before the player is presented with the choice dialog.
        If this function returns a valid 'choice', that choice will be used and the player will not be prompted.
        A valid choice is any entry from the 'choices' array.
     
        The above example selects 'fire' if the character has levels in the cleric class,
        but will otherwise leave it up to the player (i.e. it selects nothing).
     
        This function doesn't get passed any variables.
        This attribute will be ignored if the 'choices' attribute is not present.
        Even with this attribute present, the player can always change the 'choice' using the button on the sheet.
    @example
    function () {
        return classes.known.cleric ? "fire" : "";
    }
    */
    selfChoosing?: unknown;

    choicesNotInMenu: true,
    /*	choicesNotInMenu // OPTIONAL //
        TYPE:	boolean
        USE:	omit the choices from the feat (i.e. only list the main feat's name)
        ADDED:	v24.0.0
    
        If this attribute is set to true and the feat has the `choices` attribute,
        the feat will only be listed by the given `name` in the menu.
        Normally, a feat with the `choices` attribute will have each choice listed
        separately in the feat menu if any of these choices contain anything mechanically
        different than the feat (e.g. anything more than a name or description attribute).
        If so, the main name is not listed at all, just the choices.
        If you want to be sure only the main feat is listed, regardless of the choices and their
        attributes, set this attribute to true.
    
        Also, if a feat has the `selfChoosing` attribute, only the main feat will be listed.
    
        This attribute has no effect if the parent object has no `choices` attribute or if
        it has the `selfChoosing` attribute.
        Setting this attribute to false is the same as not including this attribute.
    */

    "fire": {
        /*	Choice Object Name
            TYPE:	object name
            USE:	this has to be identical to the entry in the 'choices' array that this refers to, but all lowercase
     
            This is an object within the main FeatsList object.
            This object wil be referred to as 'choice' from here on in.
            The parent FeatsList object wil be referred to as 'parent' from here on in.
        */

        name: "Purple Fire Power",
        /*	name (inside choice) // OPTIONAL //
            TYPE:	string
            USE:	name of the feat option as it will be used by the sheet
    
            If present, this name will be used instead of the name of the parent.
            This name will also be used to recognize what is typed in the feat drop-down.
    
            If no name is given, the name of an option will be dynamically generated from
            the parent and this 'choices' entry the choice refers to.
            In this example that would be "Purple Power [Fire]"
    
            IMPORTANT
            The name of an option should be unique, it can't be the same as the parent feat.
        */

        /**
         * Description of the choice
         * @example: "As an action, I can drink this potion or administer it to another to gain the effects of Haste for 1 minute (no concentration required).\rThe potion's yellow fluid is streaked with black and swirls on its own."
         */
        description: string

        /*
            >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            >>> FeatsList Attributes (inside choice) >>>
            >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    
            All the attributes described above can also be used inside a choice object, except:
                'choices'		- you can't have options inside options
                'selfChoosing'	- you can't have options inside options
                'isOriginFeat'	- sub-options can't be separate origin feats
    
            The sheet will look in both choice and parent to determine what attribute to use,
            with the choice being preferred over the parent.
    
            Most of the time you will want to at least set the description of the choice to
            something different than the parent.
    
            For example, if the parent has:
                source: ["SRD", 204],
            but the choice has:
                source: ["P", 115],
            the sheet will show the source as being the Player's Handbook, page 115.
    
            Another example, if the parent has:
                prerequisite: "Dexterity 13 or higher",
            but the choice has no 'prerequisite' defined,
            the sheet will use the prerequisite of "Dexterity 13 or higher" for the choice.
    
            You can use defaultExcluded to exclude specific choice options of the feat,
            without excluding the feat as a whole.
        */

        /*
            >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            >>> Common Attributes (inside choice) >>>
            >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    
            You can have the feat sub-choice affect different parts of the sheet as well,
            separate from the main feat.
    
            See the "_common attributes.js" file for documentation on how to do those things and more.
            All attributes in there can directly be added in this object.
    
            Note that all common attributes in the choice object will be in addition to those in the parent object,
            with the exception of things pertaining to the level-dependent limited features.
    
            LIMITED FEATURES
            'usages', 'additional', 'recovery', 'usagesCalc', and 'limfeaname' will all be
            merged from the choice object into the parent to generate a single limited feature.
        */
    },

}

type Mpmb_Feat = Mpmb_FeatBase | Mpmb_FeatWithChoices

// the entity type, with the properties I don't want thrown out
type Mpmb_Feat_Narrowed = Omit<Mpmb_Feat, ""
    // too keep it simple, just sticking with the "name" field
    | "nameAlt"
    | "nameShort"
    | "regExpSearch"

    // not implemented
    | "defaultExcluded"
    | "rangeMetric"

    // grouped together into a description object
    | "description"
    | "descriptionCantripDie"
    | "descriptionMetric"
    | "descriptionFull"
    | "descriptionShorter"
    | "descriptionShorterMetric"
>;

type FeatDefinition = Mbam_Feat & {

    /**
     * @example 'purple power'
     */
    key: string;

    description: {
        full: string        // description from the source book 
        summary: string     // description to display on the card. supports variable replacements.
        short: string       // shorter summary to be used, if summary doesn't fit (todo: am I using this?)
        concise: string;    // 1 line description
    }
}