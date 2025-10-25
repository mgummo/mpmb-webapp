// summary of documentation from https://github.com/morepurplemorebetter/2024_MPMBs-Character-Record-Sheet/blob/main/additional%20content%20syntax/weapon%20(WeaponsList).js

// https://github.com/sindresorhus/type-fest
type Arrayable<T> = T | T[];

// define core types:

type SourceKey = string
type Page = number

/** 
 * number corresponding to an ability (1 = Str, 2 = Dex, 3 = Con, 4 = Int, 5 = Wis, 6 = Cha)
 */
type AbilityId = number

type Ability = "Str" | "Dex" | "Con" | "Int" | "Wis" | "Cha"
type Skill = Ability

/**
 * An expression used to calculate a modifier
 * 
 * A number indicates a constant modifier.
 * A string is a math equation that will be evaluated, and can include the following variables:
 * Prof / Str / Dex / Con / Int / Wis / Cha
 * "" evaluates as +0
 */
type Expression = number | string

type DiceAmount = number | "C" | "B" | "Q"
type DiceType = number
type DamageType =
    "acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" |
    "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder"

// By adding a new object to the existing WeaponsList object, we create a new weapon/attack.
// The object name here is 'purple sword'. You can use any object name as long as it is not already in use.
// If you do use an object name that is already in use, you will be overwriting that object.
// Note the use of only lower case! Also note the absence of the word "var" and the use of brackets [].
interface MpmbWeapon {
    /**  
     * The display name of the weapon.
     * 
     * @example "Purple Sword"
     * @remarks This name will be capitalized (first letter of every word) before being added to the weapon drop-down.
     */
    name: string,

    /**
     * Extra names to be listed in the drop-down box
     * 
     * @remarks 
     * This list of names is added at the end of the options in the attack drop-down boxes.  
     * They will be capitalized (first letter of every word) before being added.  
     * Make sure that the `regExpSearch` also matches each and every entry in this list.  
     * 
     * @example ["Sword, Purple", "More Purple More Sword"]
     * @since v13.2.0
     */
    nameAlt?: string[]

    /**
     * Defines which source book(s) the weapon is found.
     * 
     * @remarks
     * This attribute is used by the sheet to determine if the weapon should be available depending on the sources included and excluded.
     * 
     * This array has two entries, a string followed by a number.
     * 1. string  
     *    The first entry has to be the object name of a SourceList object.
     * 2. number  
     *    The second entry is the page number to find the weapon at.  
     *    This can be any number and is ignored if it is a 0.  
     * See the "source (SourceList).js" file for learning how to add a custom source.
     * 
     * Alternatively, this can be an array of arrays to indicate it appears in multiple sources.
     * 
     * The 2nd example says something appears on both page 7 of the Elemental Evil Player's Companion and on page 115 of the Sword Coast Adventure Guide.
     * 
     * If a weapon is completely homebrew, or you don't want to make a custom source, just put the following:  
     * `source: ["HB", 0],`  
     * "HB" refers to the 'homebrew' source.  
     * 
     * @example ["SRD", 204]
     * @example [["E", 7], ["S", 115]],
     */
    source: Arrayable<[SourceKey, Page]>,

    /**
     * Indicates whether this weapon/attack should be excluded by default (true) or included by default (false)
     * 
     * @remarks
     *  Include this attribute and set it to true if the weapon/attack should appear in the Excluded list of the Source Selection Dialog when the script is added for the first time.  
     *  It will have to be manually set to be included before it is used by the sheet's automation.  
     *  The user will be made aware of this exclusion.  
     *
     *  This is useful for optional weapons/attacks that you wouldn't normally want to use (e.g. playtest or campaign-specific).
     *
     *  Setting this attribute to false is the same as not including this attribute. 
     */
    defaultExcluded?: boolean,

    /**
     * The regex used to match the text in the weapon field to see if this weapon is present
     * 
     * @remarks
     * 
     * This has to be a match for the name given earlier, or the weapon will never be recognized.  
     * The first example demonstrates looking for any entry that has both the words "sword" and "purple" in it, disregarding capitalization or word order.  
     * The (simpler) second example demonstrates looking for any entry that matches a fixed order of words.  
     * 
     * @example /^(?=.*sword)(?=.*purple).*$/i,
     * @example /purple sword/i,
     */
    regExpSearch: RegExp,

    /**
     * type of the weapon
     * 
     * The type of the weapon will be used to determine if the character is proficient with the weapon and
     * if the weapon's proficiency box should be checked for it.
     *
     *  There are several pre-defined types that exist by default in the sheet:
     *      "AlwaysProf"		// none of the other types apply, always proficient
     *      "Natural"			// natural weapons (always proficient)
     *      "Simple"			// simple weapons
     *      "Martial"			// martial weapons
     *      "Cantrip"			// cantrips (always proficient)
     *      "Spell"				// 1st-level and higher spells (always proficient)
     *      "Improvised Weapons"// improvised weapons such as vial of acid
     *
     *  Alternatively, you can define a type yourself.
     *  If this type matches a word in the 'Other Weapon Proficiencies' field,
     *  the character will be considered proficient with the weapon.
     *  But if this type doesn't match anything, proficiency will not be applied.
     *
     *  If the attack is a spell/cantrip, but it functions like a weapon attack (for fighting styles for example),
     *  then you will want to set this to "Simple" or "Martial", while also
     *  setting the `list` or `SpellsList` attributes to that of a spell/cantrip.
     *  That way, the attack is seen as both a spell and a weapon by other automation.
     * 
     * @example "Martial"
     */
    type: string,

    /**
     * The ability score used for weapon/attack
     * 
     * @remarks
     * This ability score is used to determine the To Hit (or DC) and Damage of the weapon/attack.
     * 
     * If the weapon has the finesse property, set the ability to 1.  
     * The sheet will automatically determine whether to use Strength or Dexterity based on the character's ability scores.  
     * 
     * Even with this attribute, the sheet will automatically use the spellcasting ability if:
     * - The attribute `list` or `type` is set to "Cantrip" or "Spell"
     * - or; the object name of the weapon matches an entry in the `SpellsList` object
     * - or; the attribute `SpellsList` is set and matches a `SpellsList` entry.
     * 
     * It will look for the highest spellcasting ability score from the character's spellcasting classes, but considering the following:
     * - If this spell is known by any of the character's classes, it will only consider those classes.
     * - If this spell is not known by any of the character's classes, it will consider all its spellcasting classes.
     * - If the character has no spellcasting classes, it will use the attribute given here.
     * You can change this behaviour with the `useSpellcastingAbility` attribute, see below.
     *          
     * Setting this to 0 will cause the To Hit and Damage to be calculated without any ability score modifier.
     * Setting this to false is the same as not including this attribute and will cause the weapon to not have any To Hit or Damage calculated.
     * 
     * @example 1
     */
    ability: AbilityId | 0 | false,

    /**
     * whether (true) or not (false) to add the ability score modifier to the damage
     * 
     * @remarks
     * When set to 'true', the ability score modifier set with the 'ability' attribute
     * is added to the calculated damage of the weapon/attack.
     * This will happen even if the ability score modifier is negative.
     * 
     * @example true
     */
    abilitytodamage: boolean,

    /**
     * determine the damage die and type of the damage
     * 
     * @remarks
     *  This array has three entries:
     *  1. string or number
     *      The first entry is the amount of damage die.
     *      For example, for 2d6 damage, this first entry would be '2'.
     *      Another example, for 1d8 damage, this first entry would be '1'.
     *      You can also use the letter 'C', 'B', or 'Q' (capitalized!) for the cantrip die.
     *      The 'C' is replaced with the cantrip die for the current level (e.g. 3 at level 11-16).
     *      The 'B' is replaced with one less than the cantrip die for the current level (e.g. 2 at level 11-16).
     *      The 'Q' is replaced with one more than the cantrip die for the current level (e.g. 4 at level 11-16).
     *  2. number
     *      The second entry is the type of die.
     *      For example for 2d6 damage, this second entry would be '6'.
     *      This can be any number and is ignored if it is a 0.
     *      If the damage is not a die, but just a fixed number, make this second entry an empty string ("").
     *      For example for 1 bludgeoning damage, the whole array would look like:
     *          [1, "", "bludgeoning"]
     *  3. string
     *      The third entry is the type of damage that is dealt.
     *      This can be anything, but most often it is one of the predefined damage types.
  
     *      If you don't use a predefined damage type, the string is put in the Damage Type field exactly as you put it here, including capitalization.
     *
     *   The example below is for 2d4 piercing damage.
     * 
     * @example [2, 4, "piercing"]
     */
    damage: [DiceAmount, DiceType, DamageType | string],

    // todo: check the spelllist def, see if range is more formally defined
    /**
     * the text as it will be put in the Range field for the attack
     * 
     * @remarks
     * This string is put on the sheet literally.
     * For short and long ranges, use the format `${short}/${long} ${unit}`.
     * The units should be in the imperial system and they will be
     * automatically converted to the metric system by the sheet if set to do so.
     *
     * For melee range, use "Melee".
     * 
     * @example "Melee, 20/60 ft"
     */
    range: string,

    /**
     * the text as it will be put in the Description field for the attack
     * 
     * @remarks
     * This string is put on the sheet literally.
     * The sheet will look in the description for attributes such as 'finesse' to
     *  determine the ability score to use.
     *  Thus, be sure to include all the weapon's properties here, like 'heavy', 'light', and 'two-handed'.
     *
     *  One exception, you don't have to include the 'special' property, but can instead include an
     *  explanation of what that special property is.
     *  If you decide to do so, than don't forget to set the `special` attribute but true (see below).
     * 
     * @example "Finesse, light"
     */
    description: string,

    tooltip: "Special: I have disadvantage when I use a lance to attack a target within 5 feet. Also, a lance requires two hands to wield when I'm not mounted.",
    /*	tooltip // OPTIONAL //
        TYPE:	string
        USE:	this will be added as a tooltip to the Description field for the attack
    
        This string is put as a tooltip literally, without any changes.
        The sheet will never use the tooltip for determining functionality of the weapon.
        The tooltip is only available when the sheet is used in Adobe Acrobat,
        it won't show up on a printed version of the sheet (also not when printed to PDF).
    */

    special: true,
    /*	special // OPTIONAL //
        TYPE:	boolean
        USE:	whether (true) or not (false) this weapon has the 'special' property
        ADDED:	v13.0.6
    
        This attribute has no direct affect on a weapon entry, but it can be used by other
        features that have specific rules for weapons with the 'special' property.
        For example, a Kensei Weapon (XGtE 34) can't have the 'special' property.
    
        Setting this to false is the same as not including this attribute.
    */

    /**
     * determines the sorting of the weapon in the drop-down field
     * 
     * @remarks
     *  This attribute can have any value you want.
     *  Any weapon with the same 'list' attribute will be grouped together.
     *  There are several pre-defined lists that exist by default in the sheet:
     *      "melee"		// melee weapons
     *      "ranged"	// ranged weapons
     *      "spell"		// cantrips and spells
     *      "improvised"// improvised weapons such as vial of acid
     *      "firearm"   // firearms
     *
     *  If you use any other string than the five options given above,
     *  the weapon will appear below these five lists.
     *
     *  If you don't include this attribute, the weapon will not be added as an option
     *  in the drop-down box, but will still function when typed in manually.
     *
     *  Setting this to and empty string ("") is the same as not including this attribute.
     *
     *  >> NOTE WHEN USING weaponOptions <<
     *  The 'list' attribute is ignored for WeaponsList objects used in the 'weaponOptions' attribute.
     *  Instead, all things added using the 'weaponOptions' attribute will always be added at the top of the drop-down field.
     * 
     * @example "melee"
     */
    list?: string,

    weight: 24,
    /*	weight // OPTIONAL //
        TYPE:	number
        USE:	the weight of the weapon in lb
    
        If the weapon doesn't have a listed weight, you can just leave this attribute out.
        Setting this to 0 is the same as not including this attribute.
    */

    /**
     * whether (true) or not (false) this weapon uses a DC instead of a To Hit
     * 
     * @remarks
     * If this attribute is set to 'true', the To Hit field will display a DC.  
     * That DC is calculated by adding 8 to the ability score modifier and the proficiency bonus (if the character is proficient with the weapon).  
     *
     * Note that the To Hit field will not display what kind of saving throw/check the weapon requires.  
     * You will have to add that information in the 'description' attribute.  
     *
     * Setting this to false is the same as not including this attribute.
     * 
     * @example true
     */
    dc?: boolean,

    /**
     * add something to the weapon's modifier fields
     * 
     * @remarks
     * This array has two entries:
     * 1. string or number
     *    The first entry is what to put in the To Hit modifier field.
     *    For backwards compatibility, if this starts with "dc", the To Hit will be calculated as a DC.
     *    However, it is recommended to set the `dc` attribute to `true` if you want this to be a DC.
     * 2. string or number
     *    The second entry is what to put in the Damage modifier field.
     * 
     * These modifier fields are added to the calculated values of To Hit/Damage.
     * By default, these modifier fields are hidden on the sheet.
     * Their visibility can be toggled with the "Modifiers" bookmark.
     * 
     * Both entries in the array can have the same kind of value.
     * This can be any combination of numbers, mathematical operators, and three-letter ability score abbreviations for ability score modifiers or 'Prof' for the proficiency bonus.
     *
     * For example, to add the proficiency bonus, Constitution modifier, and subtract 2, it would look like this:
     * `"Prof+Con-2"`
     * Or; to add 1, it would look like this:
     * `1`
     * 
     * Setting both entries of the array to either 0 or an empty string ("") is the same as not including this attribute.
     * 
     * @example [1, ""]
     * @example ["Prof+Con-2", "Prof+Con-2"]
     */
    modifiers?: [Expression, Expression],
    /*	
    
 
    */
    monkweapon: true,
    /*	monkweapon // OPTIONAL //
        TYPE:	boolean
        USE:	whether (true) or not (false) this weapon is a monk weapon and should use the Martial Arts die
    
        This attribute only has an effect for a character with the monk class.
    
        Setting this to false is the same as not including this attribute.
    */
    isMagicWeapon: true,
    /*	isMagicWeapon // OPTIONAL //
        TYPE:	boolean
        USE:	whether (true) or not (false) this weapon is a magical weapon
    
        This attribute only has an effect for attack calculations and magic item selection.
        Add this if you don't want class features and the like to add modifiers or write "Counts as magical" in the description of this attack.
        Also add this if you don't want this weapon to be an option for magical weapons to add their attributes to.
        Note that if you set the 'type' attribute to "Cantrip" or "Spell", it will already be treated as a magical attack.
    
        Weapons added by magic items using the 'weaponOptions' attribute will always have this attribute added and set to 'true'.
    
        Setting this to false is the same as not including this attribute.
    */
    isNotWeapon: true,
    /*	isNotWeapon // OPTIONAL //
        TYPE:	boolean
        USE:	whether (false) or not (true) this attack is counted as a weapon
        ADDED:	v13.1.8
    
        Normally, the sheet sees everything as a weapon, except those with a `type` attribute
        that includes either the words "spell" or "cantrip", which are set to be a spell.
        Something that is a weapon is automatically either a ranged or a melee weapon.
        Something can be both a spell and a weapon (by using the `SpellsList` attribute below and
        setting the `type` attribute to something else then "Spell" or "Cantrip").
    
        If this attribute is set to `true`, the sheet will make sure the attack is not considered
        a weapon.
        In doing so, the attack can still be considered a spell.
        The attack can also be considered neither a spell nor a weapon.
        This is used, for example, for the attacks made with adventuring gear:
          - Alchemist Fire
          - Vials of Acid
          - Holy Water
          - Burning Torch
    
        This attribute only has an effect for attack calculations and features adding text to an
        attack's description. For example, Sneak Attack requires the attack to be made with a
        ranged weapon.
    
        See also the `calcChanges` attribute in "_common attributes.js", and specifically the
        atkAdd and atkCalc sub-attributes.
    
        Setting this to false is the same as not including this attribute.
    */
    isAlwaysProf: true,
    /*	isAlwaysProf // OPTIONAL //
        TYPE:	boolean
        USE:	whether (true) or not (false) the proficiency bonus should always be added for this weapon
        CHANGE: v13.2.0 (`false` is now a valid value)
    
        This attribute forces the proficiency checkbox to be on (true) or off (false)
        when a weapon is selected.
        Add this for weapons where the normal way of determining proficiency would not produce the correct result.
    
        Without this attribute, the sheet will automatically determine if the character is
        proficient with the weapon. The sheet automatically marks something as proficient if:
            * The `type` attribute is "Spell", "Cantrip" or "Natural".
            * The `type` attribute is "Simple" or "Martial" and the relevant proficiency
              checkbox is checked on the sheet.
            * The box for other weapon proficiencies matches of the weapon: the object name or 
              the `type`, `list`, `baseWeapon`, or `nameAlt` attribute.
    
        TRUE
        When set to `true`, the sheet will always check the Proficiency checkbox when this weapon is selected.
    
        FALSE
        When set to `false`, the sheet will never check the Proficiency checkbox when this weapon is selected.
    
        UNDEFINED
        Do not include this attribute if you want the sheet to determine proficiency itself.
    
        The checkbox can still be changed manually or with features using `calcChanges.atkAdd`.
    	
        For example, if you set 'type' above to 'Cantrip', setting this to 'true' will have no extra effect.
        But setting it to 'false' will force the weapon not to add proficiency to its to hit / DC.
        Another example, if you set 'type' above to 'Simple', setting this to 'true' will add
        proficiency even if the character is not proficient with simple weapons.
    
        Setting this to false is NOT the same as not including this attribute!
    */
    ammo: "bolt",
    /*	ammo // OPTIONAL //
        TYPE:	string
        USE:	the AmmoList object name of the ammunition that this attack uses
    
        If the attack you are adding is a weapon that uses ammunition,
        you can have the sheet automatically add it to the ammunition section when the weapon is added to the sheet.
    
        The options are: "arrow", "bolt", "bullet", "dagger", "dart", "flask", "axe", "javelin",
        "hammer", "needle", "spear", "trident", and "vial" [note the use of only lower case!].
    
        This list of options can be greater if you add another AmmoList object using the "ammunition (AmmoList).js" syntax file.
    
        Setting this to an empty string ("") is the same as not including this attribute.
    */

    SpellsList: "eldritch blast",
    /*	SpellsList // OPTIONAL //
        TYPE:	string
        USE:	the SpellsList object name that this attack is linked to
    
        If the attack you are adding is a cantrip/spell and its object name is not identical to
        the object name of the cantrip/spell in the SpellsList, set the reference with this attribute.
    
        By setting this attribute, the sheet will be able to recognize which cantrips/spell this attack is for.
        As a result, it will be able to determine which ability score to use for it automatically from the character's spellcasting classes.
    
        Setting this to an empty string ("") is the same as not including this attribute.
    */

    /**
     * force the use of the spellcasting ability for the weapon
     * 
     * @remarks
     * Without this attribute, the sheet will automatically use the spellcasting ability if:
     * - The attribute `list` or `type` is set to "Cantrip" or "Spell", or
     * - the object name of the weapon matches an entry in the `SpellsList` object, or
     * - the attribute `SpellsList` is set and matches a `SpellsList` entry.
     * 
     * Which spellcasting ability it selects is explained in the `ability` attribute above for more details.
     * 
     * TRUE  
     * When set to `true`, the sheet will always apply the spellcasting ability, even if the prerequisites are not met.
     * 
     * FALSE  
     * When set to `false`, the sheet will never apply the spellcasting ability, even if the prerequisites are met. It will instead always use the ability set by the `ability` attribute.  
     * It will still apply weapon special rules like 'Finesse'.  
     * The sheet will also not apply any bonuses from calcChanges.spellCalc that increase spell attacks or spell DCs to the attack.
     * 
     * UNDEFINED  
     * Do not include this attribute if you want the sheet to determine if the spellcasting ability should be used or not.
     * 
     * Setting this to false is NOT the same as not including this attribute!
     * 
     * @example true
     */
    useSpellcastingAbility?: boolean,

    useSpellMod: ["wizard", "cleric"],
    useSpellMod: "wizard",
    /*	useSpellMod // OPTIONAL //
    TYPE:	string or array of strings
    USE:	the object name of a spellcasting object that this attack will use the spell attack/DC from
    ADDED:	v13.0.6
    CHANGE:	v14.0.0 (can now be an array of strings)
    
    If the attack you are adding used the spell attack (or DC) of a fixed spellcasting entity
    (class, race, feat, or magic item), then you can use this attribute.
    This will most likely be used as part of a `weaponOptions` or `creatureOptions` attribute,
    when a feature adds an attack option, or creature option with attacks linked to the original feature.
    For example, if a magic item grants an attack that uses the `fixedDC` of that magic item,
    or a class feature grants a companion option that uses the spell attack of the class.
    
    If this is an array, the sheet will pick the ability that results in the highest value.
    This works bests when the spell sheet has been generated, otherwise the sheet won't look
    at bonuses other than the ability modifier (e.g. no bonus from `calcChanges.spellCalc`).
    
    Make sure that the string is an object name for a spellcasting object.
    Spellcasting objects are created when something has spells that are displayed on the spell sheet pages.
    The spellcasting object names are identical to the originating object names.
    For example, for a spellcasting class, this object name is their ClassList object name
    (e.g. 'bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'),
    and for a Magic Item this is identical to the MagicItemsList object name.
    
    If there is no corresponding spellcasting object, this attribute will be ignored.
    
    By setting this attribute, the sheet will force the use of the spell attack
    (or DC if the `dc` attribute is set to true) of the corresponding spellcasting entity,
    regardless of the setting of the proficiency or ability score fields in the attack section.
    In fact, it will force the selected ability to be the ability used by the spellcasting entity.
    
    Be aware, that if you use this for a CreatureList object, the spell attack / DC used will
    still be that of the main character.
    This attribute is ignored on the Wild Shape pages.
    
    Setting this to an empty string ("") is the same as not including this attribute.
    */

    baseWeapon: "longsword",
    /*	baseWeapon // OPTIONAL //
        TYPE:	string
        USE:	the WeaponsList object name that this attack is based on
    
        By setting this attribute, the sheet will consider this attack entry to be the same as the one you link it to.
        Linking a weapon to another will have far-reaching consequences:
        1. attributes will be added
            All the attributes of the base weapon will be added to this weapon as well.
            Attributes in this WeaponsList object will take precedent over those from the base weapon.
            Because of that, you don't have to set all REQUIRED attributes, except for the
            'name', 'source', and 'regExpSearch' attributes.
            For example, if this attribute is 'longsword' and you don't include a 'type' attribute,
            the 'type' attribute will be "Martial" as that is the type set for WeaponsList["longsword"].
        2. other weapon proficiencies
            If the character is proficient with the linked base weapon because of a proficiency in the Other Weapon Proficiencies field,
            it will also be considered to be proficient with this weapon.
        3. weapon calculation scripts
            Class features and the like can affect how To Hit and Damage are calculated for weapons.
            By linking a weapon to a base weapon those scripts that would affect the base weapon will also affect this weapon.
    
        Setting this to an empty string ("") is the same as not including this attribute.
    */

    /*	selectNow // OPTIONAL //
        TYPE:	boolean
        USE:	whether (true) or not (false) this weapon should immediately be selected
        ADDED:	v13.1.14
    
        This attribute only has an effect on weapons added through the `weaponOptions` common attribute 
        (see '_common attributes.js').
    
        By setting this attribute to `true`, it is no longer necessary to include the
        `weaponsAdd` attribute as well.
    
        This attribute has no effect outside of `weaponOptions`.
        For armour added directly in the WeaponsList, this attribute will be ignored.
    
        Setting this to false is the same as not including this attribute.
    */
    selectNow: true,
}

type Weapon = Omit<MpmbWeapon, 'dc'> & {
    dc: boolean | [skill, Expression, string, string]
}

type Internal<Weapon> = Weapon & {
    /** 
     * The key used to register this weapon in the WeaponsList dictionary.
     * 
     * @example 'purple sword'
     * */
    key: string

    // support multiple damage expressions in a single attack
    damage: Arrayable<[[DiceAmount, DiceType, DamageType | string]]>

    // support more complex dc checks
    // dc[0] is the skill being checked
    // dc[1] is an expression that defines the skill check DC (todo: differentiate between DC 10 and SPELLCASTING DC +10)
    // dc[2] pass description
    // ex: "half damage"
    // what to indicate for no damage
    // dc[3] fail description
    // ex: "takes damage" // todo: wordsmithing?
    dc?: [skill, Expression, string, string]
}


