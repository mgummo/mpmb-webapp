type ItemType =
    "wondrous item"
    | "armor"
    | "shield"
    | "weapon"
    | "ring"
    | "rod"
    | "staff"
    | "wand"
    | "potion"
    | "scroll";

type Rarity =
    "common"
    | "uncommon"
    | "rare"
    | "very rare"
    | "legendary"
    | "artifact";

type ChooseGear = {
    /*	chooseGear // OPTIONAL //
        TYPE:	object
        USE:	ask the player what type of gear (weapon, armor, ammunition) the item should be
    
        This attribute will show a pop-up dialog for the player to make a selection for a type of gear (weapon, armor, or ammunition).
        Not all gear will be present in the pop-up, it will only include the following:
            - Armours that are light, medium, or heavy (so no natural or magical armours)
            - Weapons that are not listed as being natural, cantrips, or spells
            - Ammunition that is not also listed in the WeaponsList (e.g. no spear, hand axe, or trident)
    
        The name of the selected gear will be added to the name of the magic item, and
        it will be put in the appropriate field on the 1st place (barring space).
    
        This object must have at least the 'type' attribute.
        All other attributes for this object are optional.
        Each attribute is described separately below.
    */
    type: "armor",
    /*	type // REQUIRED //
        TYPE:	string
        USE:	the type of gear (weapon, armor, ammunition) this concerns
 
        This attribute can be one of three options:
            "armor"
            "weapon"
            "ammo"
    */

    /**	
     * filter things from the list of weapon, armor, or ammunition from the options
     * 
     * @remarks
        This function is called for each entry in the WeaponsList, ArmourList, or AmmoList (depending on 'type', see above).
        If the function returns `true` for an entry, that entry will be omitted from the pop-up dialog.
        This function is passed two variables:
        1)	inObjKey
                A string of the name of the entry in the list variable (WeaponsList, ArmourList, or AmmoList)
        2)	inObj
                The object of the entry (e.g. WeaponsList[inObjKey])
     
        The above example returns true for the ArmourList 'hide' entry, making sure that the Hide armour is not part of the pop-up.
        @example function (inObjKey, inObj) {
            return inObjKey == "hide";
        },
    */
    excludeCheck?: (inObjKey, inObj) => boolean;

    /**
     * determine how the name of the selected gear is added to the name of the magic item
     * 
     * @remarks
        CHANGE: v13.2.3 (added "between" option)
 
        This attribute can be one of four options:
        (with examples for the magic item "Armor of Resistance" and the armour "Breastplate")
        1. "prefix" 	// Add the name of selected gear before the name of the magic item
                Example: "Breastplate Armor of Resistance"
 
        2. "suffix" 	// Add the name of selected gear after the name of the magic item
                Example: "Armor of Resistance Breastplate"
 
        3. "brackets"	// Add the name of selected gear in brackets after the name of the magic item
                Example: "Armor of Resistance (Breastplate)"
 
        4. An array with three strings, a way to put text around the name of the selected gear:
            4.1 "between"	The first entry must always be exactly this, so that it mirrors how
                            `itemName1stPage` works, see below.
            4.2 A string that is put in front of the selected gear's name.
            4.3 A string that is put behind the selected gear's name.
 
            The sheet will add spaces.
 
            For example, this code:
                prefixOrSuffix : ["between", "Efreeti", "Armor"],
            when selecting "Padded" armour, will result in:
                "Efreeti Padded Armor"
 
            -IMPORTANT-
            If you use this method, you need to make sure that all possible options still
            match either the `name`, `nameAlt`, or `nameTest` of the magic item.
            The best way to do that is by adding the `nameTest` attribute with a regular
            expression, which can be as simple as:
                /efreeti.*armor/i
            N.B. `.*` in a regular expression means any number of characters of any type.
 
        If this attribute is not present, the sheet will use the option "prefix".
 
        Unless the 'itemName1stPage' attribute is present, see below, the resulting name
        is also used to populate the 1st page.

        @example "suffix"
        @example ["between", "Efreeti", "Armor"]
    */
    prefixOrSuffix?: Arrayable<string>;

    descriptionChange: ["prefix", "armor"],
    /*	descriptionChange // OPTIONAL //
        TYPE:	array
        USE:	what part of the magic item's description to add the name of the selected gear to
 
        This array must always have 2 entries, each of which is a strings:
        1. The first string determines how the name of the selected gear is added to the magic item's description.
            This can be one of four options:
            1.1 "replace"	// Replace the 2nd array entry with the name of the selected gear
            1.2 "prefix"	// Add the name of selected gear before the 2nd array entry
            1.3 "suffix"	// Add the name of selected gear after the 2nd array entry
            1.4 "brackets"	// Add the name of selected gear in brackets after the 2nd array entry
        2. The second string is the string that selected gear will be replaced/amended to.
            Common uses include "armor", "weapon", and "ammunition".
            Only the first instance of the 2nd array entry in the magic item's description will be replaced/amended.
 
        If this attribute is not present, the sheet will determine it automatically:
        1. How the selected name will be amended will be identical to the 'prefixOrSuffix' attribute.
            If the 'prefixOrSuffix' attribute is not present, it will use "prefix".
        2. The string to amend the name of the selected gear to is determined by type:
            "armor", "weapon", or "ammunition".
    */

    /**	itemName1stPage // OPTIONAL //
        TYPE:	array
        USE:	how the name added to the 1st page should look like
        CHANGE: v13.0.9 (added "between" option)
 
        The resulting name is used to populate the 1st page.
        If this attribute is not present, the sheet will use the name as it
        resulted from the 'prefixOrSuffix' attribute, see above.
 
        This array must always have 2 entries, each of which is a strings:
        1. The first string determines how the name of the selected gear is added the 2nd array entry.
            This can be one of four options:
            1.1 "prefix"	// Add the name of selected gear before the 2nd array entry
            1.2 "suffix"	// Add the name of selected gear after the 2nd array entry
            1.3 "brackets"	// Add the name of selected gear in brackets after the 2nd array entry
            1.4 "between"	// Add the name of selected gear between the 2nd and 3rd array entries
        2. The second string is the string that selected gear will be amended to.
            Use something that makes clear what magic item this concerns.
        3. The third string is the string that will be used if the first entry is set to "between".
            The result will then be "[2nd entry] [weapon name] [3rd entry]".
    	
        The automation will add the spaces between the text.
        @example ["prefix", "of Purple"]
        @example ["between", "Purple", "of Sparkles"]
    */
    itemName1stPage?: string[];

    ammoAmount: 20,
    /*	ammoAmount // OPTIONAL //
        TYPE:	number
        USE:	set the amount of ammunition to add to the first page (if `type` = "ammo")
        ADDED:	v13.0.9
 
        This attribute can only be used if the `chooseGear.type` attribute above is set to "ammo".
 
        If this attribute is not included, the sheet will default to adding 1 of the magic
        ammunition in the ammunition section.
    */

    /**
     * armours matching this never impose disadvantage on stealth checks
     * 
     * @remarks
        ADDED:	v13.2.2
 
        This attribute can only be used if the `chooseGear.type` attribute above is set to "armor".
 
        If the content entered into the armour field matches the provided regular expression,
        the checkbox for the armour granting disadvantage will always be unchecked.
        N.B. this checkbox is a "modifier field" on the printer friendly sheets, and thus
        only visible when the modifier fields are toggled to be shown.
 
        Use this if you are adding an armour that normally imposes disadvantage on stealth,
        but the variation added by the feature doesn't.
        @example /mithral/i
    */
    noStealthDis?: RegExp;

    /**	
     * armours matching this always impose disadvantage on stealth checks
     * 
     * @remarks
        ADDED:	v13.2.2
 
        This attribute can only be used if the `chooseGear.type` attribute above is set to "armor".
 
        If the content entered into the armour field matches the provided regular expression,
        the checkbox for the armour granting disadvantage will always be checked.
        N.B. this checkbox is a "modifier field" on the printer friendly sheets, and thus
        only visible when the modifier fields are toggled to be shown.
 
        Use this if you are adding an armour that normally doesn't impose disadvantage on
        stealth, but the variation added by the feature does.
        @example /oversized/i
    */
    forceStealthDis?: RegExp;

};

type Mpmb_MagicItem = {

    /**	name // REQUIRED //
        TYPE:	string
        USE:	name of the magic item as it will be used by the sheet
    
        This name will be used to recognize what is selected in the magic item drop-down.
        If you want more options for the magic item to be recognized as, see 'nameAlt' and 'nameTest' below.
    */
    name: "Staff of Purple",

    /**	name // OPTIONAL //
        TYPE:	string
        USE:	name of the magic item as it will be shown in the menu for selecting magic items
        ADDED:	v13.0.8
    
        This name will only be used to display the item in the menu.
        This attribute is not used to recognize the item or fill the field on the sheet.
    */
    sortname: "Staff, Purple",

    /**	nameAlt // OPTIONAL //
        TYPE:	string
        USE:	alternative setting-independent name with which the sheet can recognize the magic item
    
        This attribute is intended for magic items that have a name that is bound to a specific setting,
        to allow a name that is setting-neutral.
        For example, the "Apparatus of Kwalish" (DMG 151) is named after the legendary wizard "Kwalish" of the Greyhawk setting.
        As not everybody wants to use the Greyhawk name, the name as given in the SRD page 208 "Apparatus of the Crab" is good to provide as the 'nameAlt'
    
        This name will also be used to recognize what is typed into the magic item drop-down.
        The shortest of the 'name', 'nameAlt', and 'nameTest' attributes will be used for the 'chooseGear' attribute, see below.
    */
    nameAlt: "Staff of Colour Magic",

    /**	
     * alternative name with which the sheet can recognize the magic item
     * 
     * @remarks
        This name will also be used to recognize what is typed into the magic item drop-down.
        The shortest of the 'name', 'nameAlt', and 'nameTest' attributes will be used for the 'chooseGear' attribute, see below. Note that it will only be used for chooseGear if it is a string.
        @example "Purple Staff"
        @example /^(?=.*staff)(?=.*magic)(?=.*(green|red|blue|orange|yellow|pink))).*$/i
    */
    nameTest?: string | RegExp;

    /**
     * Which source book(s) define the item.
     */
    source: SourceList;

    /*	defaultExcluded // OPTIONAL //
        TYPE:	boolean
        USE:	whether this magic item should be excluded by default (true) or included by default (false)
    
        Include this attribute and set it to true if the magic item should appear in the Excluded list of the
        Source Selection Dialog when the script is added for the first time.
        It will have to be manually set to be included before it is used by the sheet's automation.
        The user will be made aware of this exclusion.
    
        This is useful for optional magic items that you wouldn't normally want to use (e.g. playtest or campaign-specific).
    
        Setting this attribute to false is the same as not including this attribute.
    */
    defaultExcluded: true;

    /**
     * define what type the magic item is, to be used in the tooltip and to sort the item
     * @example "wondrous item"
     */
    type: ItemType;

    /**
     * define what rarity the magic item is, to be used in the tooltip and to sort the item
     *  @example "rare"
    */
    rarity: Rarity;

    /**	notLegalAL // OPTIONAL //
        TYPE:	boolean
        USE:	set this to true if it the item is not legal in Adventurers League play
    
        If this attribute is defined, the 'magicItemTable' and 'storyItemAL' attributes are ignored.
        Setting this to false is the same as not including this attribute.
    
        If none of the three attributes 'magicItemTable', 'storyItemAL', or 'notLegalAL' are defined,
        the magic item will be treated as one that can be used in AL, but can't be traded.
    */
    notLegalAL: true;

    /**	
     * define what table(s) in the DMG that the magic item appears on (or as listed in the AL Content Catalog)
     * 
     * @remarks
        This attribute is used for sorting the items and for the magic item trading rules in the Adventurers League.
    
        The string (or each string in the array) contains just a single letter indicating the table.
        For most items this will be a string,
        but you can have an array with multiple entries for items that appear on multiple tables.
    
        This attribute is ignored if the 'notLegalAL' attribute is defined.
        If this attribute is defined, the 'storyItemAL' attribute is ignored.
    
        If none of the three attributes 'magicItemTable', 'storyItemAL', or 'notLegalAL' are defined,
        the magic item will be treated as one that can be used in AL, but can't be traded.
        @example: "H"
        @example: ["B", "E"]
    */
    magicItemTable?: Array<string>;

    /**	storyItemAL // OPTIONAL //
        TYPE:	boolean
        USE:	set this to true if it is a 'Story Item' in Adventurers League play
    
        This attribute is ignored if the 'magicItemTable' or 'notLegalAL' attribute is defined.
        Setting this to false is the same as not including this attribute.
    
        If none of the three attributes 'magicItemTable', 'storyItemAL', or 'notLegalAL' are defined,
        the magic item will be treated as one that can be used in AL, but can't be traded.
    */
    storyItemAL: true,

    /**	extraTooltip // OPTIONAL //
        TYPE:	string
        USE:	text to add to the bullet points in the tooltip for the magic item
    
        This attribute is intended for adding information about the magic item for use in Adventurers League.
        For example, a Potion of Climbing can always be bought for 75 gp in AL play and doesn't need to be unlocked.
    */
    extraTooltip: "AL: can always be bought for 75 gp";

    /**	attunement // OPTIONAL //
        TYPE:	boolean
        USE:	set to true if the magic item requires attunement
    
        If the magic item doesn't require attunement, you can just leave this attribute out.
        Setting this to false is the same as not including this attribute.
    */
    attunement: true;

    /**	weight // OPTIONAL //
        TYPE:	number
        USE:	the weight of the magic item in lb
    
        If the magic item doesn't have a listed weight, you can just leave this attribute out.
        Setting this to 0 is the same as not including this attribute.
    */
    weight: 12,

    /**	prerequisite // OPTIONAL //
        TYPE:	string
        USE:	textual explanation of a prerequisite the item has
    
        If the magic item doesn't have a prerequisite, you can just leave this attribute out.
        Setting this to "" is the same as not including this attribute.
    */
    prerequisite: "Requires attunement by a dwarf"

    /**	
     * this should return 'true' if the prerequisite is met or 'false' otherwise
     * 
    */
    prereqeval?: (v: PreReqContext) => boolean;

    /**	allowDuplicates // OPTIONAL //
        TYPE:	boolean
        USE:	set to true if multiples can exist of this magic item (e.g. a potion or using 'choices' attribute)
    
        If the magic item doesn't allow duplicates, you can just leave this attribute out.
        Setting this to false is the same as not including this attribute.
    
        IMPORTANT NOTE IF USING 'choices' ATTRIBUTE
        When this item has multiple forms and uses the 'choices' attribute,
        you probably want to set the 'allowDuplicates' attribute to true.
        If you don't set this attribute to true, the sheet will only allow this item to exist once,
        regardless if another instance has another form (choices) selected.
    */
    allowDuplicates: true;

    /*	description // REQUIRED //
        TYPE:	string
        USE:	the text to be filled in the description field of the magic item
        CHANGE: v14.0.0 (formatting characters)
    
        Note that the sheet normally uses the first person for this.
        Make sure that this description is not too long and fits on the description field on
        the 3rd page.
        The Printer Friendly sheets have less space for Magic Item descriptions than the
        Colourful versions, so use the Printer Friendly sheets to test if the description fits.
    
        Note that the space for magic item descriptions on the overflow is much larger than on
        the 3rd page, but this description needs to fit in a section on the 3rd page.
    
        FORMATTING CHARACTERS (since v14.0.0)
        This can be formatted using the Rich Text formatting characters.
        Text between the formatting characters will be displayed differently on the sheet.
        The formatting characters are as follows:
            *text*   = italic
            **text** = bold
            _text_   = underlined [doesn't work in tooltips/pop-ups]
            ~text~   = strikethrough [doesn't work in tooltips/pop-ups]
            #text#   = Header 1:
                       - bold and theme color (Colourful)
                       - bold and 15% size increase (Printer Friendly)
            ##text## = Header 2:
                       - italic, bold, and theme color (Colourful)
                       - italic and bold (Printer Friendly)
    
        You can combine the formatting characters to apply multiple formatting options to one
        string, but there are some limitations to consider.
            1. Formatting characters don't work across line breaks (`\r` and `\n`).
                This won't work:
                    "**text before and" + "\n" + "text after line break**"
                Instead do this:
                    "**text before and**" + "\n" + "**text after line break**"
            2. Combining formatting characters requires them to be in the same or reversed order.
                This won't work:
                    _**~underlined, strikethrough, and bold**_~"
                Instead do this:
                    "_**~underlined, strikethrough, and bold~**_"
                or this:
                    "_**~underlined, strikethrough, and bold_**~"
            3. Tabs (`\t`) and multiple spaces will break the formatting if the field is edited manually.
                This should be avoided:
                    "**text before and" + "\t" + "text after tab**"
                Instead do this:
                    "**text before and**" + "\t" + "**text after tab**
    
        Be aware that the default font on the Colourful sheets is already italic,
        so making something only italic won't be visible on the Colourful sheets.
        @example "As an action, command the jug to produce liquid; or an action to uncorked it and pour 2 gal/min. After producing, it only makes the same up to its max, until next dawn. Oil (1 qt), acid (8 fl oz), basic poison (1/2 fl oz), beer (4 gal), honey/wine (1 gal), fresh water (8 gal), mayonnaise/vinegar (2 gal), salt water (12 gal)."
    */
    description: string;

    /**	descriptionLong // OPTIONAL //
        TYPE:	string
        USE:	the text to be filled in the description field of the magic item, but only on the overflow page
        CHANGE: v14.0.0 (formatting characters)
    
        Use this attribute in addition to the 'description' attribute.
        This attribute will only be used when the magic item is added on the overflow page,
        for the third page the 'description' attribute will be used.
        Only use this attribute if a longer description on the overflow page makes sense.
        There is no reason in having the 'description' and 'descriptionLong' be the same.
    
        Note that the sheet normally uses the first person for this.
        Make sure that this description is not too long and fits on the description field
        on the overflow page.
        The Printer Friendly sheets have less space for Magic Item descriptions than the
        Colourful versions, so use the Printer Friendly sheets to test if the description fits.
    
        FORMATTING CHARACTERS (since v14.0.0)
        This can be formatted using the Rich Text formatting characters.
        See the `description` attribute above for an explanation of how they work.
        @example "A heavy ceramic jug. As an action, the jug can be commanded to hold a chosen liquid. With another action, I can uncork the jug and pour the liquid out at 2 gallons per minute. Once commanded to produce a liquid, it can't produce a different one or more than the maximum of one, until the next dawn.\nLiquids (with maximum): acid (8 fl. oz.), basic poison (1/2 fl. oz.), beer (4 gallons), honey (1 gallon), mayonnaise (2 gallons), oil (1 quart), vinegar (2 gallons), fresh water (8 gallons), salt water (12 gallons), wine (1 gallon)."
    */
    descriptionLong: string;

    /**
     * description of the magic item as it appears in its source
     * 
     * @remarks
        CHANGE: v14.0.0 (array option & formatting tags)
        
            This text is used to populate the tooltip of the magic items so that the original description can be read.
            This description will also be available in a pop-up by using the button in the magic item's line.
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
            This can happen if the magic item has the `toNotesPage` attribute with
            `useFullDescription: true`, for example.

        @example "You have a swimming speed of 40 feet while wearing this ring."
        @example  [
            "Introduction text of the spell. This will not be preceded by a line break or three spaces as this is the first paragraph.",
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
    descriptionFull?: string | string[];

    /**
     * this string is set as the field calculation method for the description field of the magic item
     * 
     * @remarks
       CHANGE: v14.0.0 (formatting characters)
   
       The string is evaluated as JavaScript code whenever anything changes on the sheet.
       To change the value of the field, you will have to set the 'event.value' to something.
       The example above sets the field to a text with calculated numbers in the text,
       the character level and Charisma Modifier.
   
       If this attribute is present, the 'description' and 'descriptionLong' attributes will both be useless.
       Remember that the 'description' attribute is still requires, so you might just want to set it to an empty string:
           description : "",
   
       FORMATTING CHARACTERS (since v14.0.0)
       The resulting string can be formatted using the Rich Text formatting characters.
       See the `description` attribute above for an explanation of how they work.
       @example "event.value = 'I can spend 10 minutes inspiring up to 6 friendly creatures within 30 feet who can see or hear and can understand me. Each gains lvl (' + What('Character Level') + ') + Cha mod (' + What('Cha Mod') + \") temporary hit points. One can't gain temporary hit points from this item again until after a short rest.\";"
   */
    calculate?: string;

    chooseGear: ChooseGear;

}
    & CommonAttributes //You can have the magic item affect different parts of the sheet like adding proficiencies, adding spellcasting abilities, actions, limited features, etc. etc.
    & CompositeItem

// >>>>>>>>>>>>>>>>>>>>>>>
// >>> Composite Items >>>
// >>>>>>>>>>>>>>>>>>>>>>>
/**
 *  The next part is about the use of the 'choices' attribute, which is optional.
    The 'choices' attribute will allow the magic item to have a subset of options.
    The player will be forced to select one of those options, the item will not be usable without a selection.
  
    To set up a choice, add the 'choices' attribute, see below, and add an object for each of those choices.
    The object name has to be exactly the same as the string in the 'choices' array, but need to be all lowercase.
 */
type CompositeItem = {

    /**
     * options for the magic item
     * 
     * @remarks
        The text in the array is presented to the player as options to choose from for what form of the magic item to use.
        The order of this array is used exactly as you write it.
        If you include this attribute, an option will have to be chosen.
    
        You will have to make a 'choice' object for each item you include in this array.
        To make a choice object, use the exact name of the entry in this array, but lowercase.
        See the below example "fire" for more information.
        @example ['Fire', 'Ice']
    */
    choices?: string[],

    /**
     * select the 'choice' automatically when the item is added
     * 
     * @remarks
        If the magic item has the 'choices' attribute, the function in this attribute will be run
        before the player is presented with the choice dialog.
        If this function returns a valid 'choice', that choice will be used and the player will not be prompted.
        A valid choice is any entry from the 'choices' array.
     
        The above example selects 'fire' if the character has levels in the cleric class,
        but will otherwise leave it up to the player (i.e. it selects nothing).
     
        This function doesn't get passed any variables.
        This attribute will be ignored if the 'choices' attribute is not present.
        Even with this attribute present, the player can always change the 'choice' using the button on the sheet.
        @example function () {
        return classes.known.cleric ? "fire" : "";
    }
    */
    selfChoosing: () => string,

    /*	choicesNotInMenu // OPTIONAL //
        TYPE:	boolean
        USE:	omit the choices from the item menu (i.e. only list the main item's name)
        ADDED:	v13.0.9
    
        If this attribute is set to true and the magic item has the `choices` attribute,
        the magic item will only be listed by the given `name` in the menu.
        Normally, a magic item with the `choices` attribute will have each choice listed
        separately in the magic item menu if any of these choices contain anything mechanically
        different than the main item (e.g. anything more than a name or description attribute).
        If so, the main name is not listed at all, just the choices.
        If you want to be sure only the main item is listed, regardless of the choices and their
        attributes, set this attribute to true.
    
        Also, if an item has the `selfChoosing` attribute, only the main item will be listed.
    
        This attribute has no effect if the parent object has no `choices` attribute or if
        it has the `selfChoosing` attribute.
        Setting this attribute to false is the same as not including this attribute.
    */
    choicesNotInMenu: true;

    /**	
     * this has to be identical to the entry in the 'choices' array that this refers to, but all lowercase
     * @ example: "fire": { //... }
     */
    [key: string]: ChoiceObject;
}

type ChoiceObject = {

    /*
            This is an object within the main MagicItemsList object.
            This object wil be referred to as 'choice' from here on in.
            The parent MagicItemsList object wil be referred to as 'parent' from here on in.
        */

    name: "Staff of Purple Flame",
    /*	name (inside choice) // OPTIONAL //
        TYPE:	string
        USE:	name of the magic item option as it will be used by the sheet
 
        If present, this name will be used instead of the name of the parent.
        This name will also be used to recognize what is typed in the magic item drop-down.
 
        If no name is given, the name of an option will be dynamically generated from
        the parent and this 'choices' entry the choice refers to.
        In this example that would be "Staff of Purple [Fire]"
 
        IMPORTANT
        The name of an option should be unique, it can't be the same as the parent item.
    */

    description: "As an action, I can drink this potion or administer it to another to gain the effects of Haste for 1 minute (no concentration required).\rThe potion's yellow fluid is streaked with black and swirls on its own.",
    /*
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        >>> MagicItemsList Attributes (inside choice) >>>
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 
        All the attributes described above can also be used inside a choice object, except:
            'choices'	- you can't have options inside options
 
        The sheet will look in both choice and parent to determine what attribute to use,
        with the choice being preferred over the parent.
 
        Most of the time you will want to at least set the description of the choice to
        something different than the parent.
 
        For example, if the parent has:
            attunement : true,
        but the choice has:
            attunement : false,
        the sheet will not show the attunement checkbox when this choice is selected.
 
        Another example, if the parent has:
            weight : 1,
        but the choice has no 'weight' defined,
        the sheet will use the weight of 1 lb for the choice.
 
        You can use defaultExcluded to exclude specific choice options of the magic item,
        without excluding the magic item as a whole.
    */

    /*
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        >>> Common Attributes (inside choice) >>>
        >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 
        You can have the magic item sub-choice affect different parts of the sheet as well,
        separate from the main magic item.
 
        See the "_common attributes.js" file for documentation on how to do those things and more.
        All attributes in there can directly be added in this object.
 
        Note that all common attributes in the choice object will be in addition to those in the parent object,
        with the exception of things pertaining to the level-dependent limited features.
 
        LIMITED FEATURES
        'usages', 'additional', 'recovery', 'usagesCalc', and 'limfeaname' will all be
        merged from the choice object into the parent to generate a single limited feature.
    */
}

type MagicItemDefinition = Mpmb_MagicItem & {
    /**
     * @example "staff of purple"
     */
    key: string
}

type ItemCard = any