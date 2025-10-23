(function (global) {

    ExtendWeaponsList(mpmb.lists.WeaponsList)
    ExtendSpellsList(mpmb.lists.SpellsList)

    // let spells = SelectSpells(mpmb.lists.SpellsList)
    let spells = SelectAllSpells(mpmb.lists.SpellsList)


    function ExtendWeaponsList(list) {

        // fix description
        mpmb.AddWeapon("produce flame", {
            regExpSearch: /^(?=.*produce)(?=.*flame).*$/i,
            name: "Produce Flame",
            source: ["P24", 308],
            list: "spell",
            ability: 5, // why is this set to charisma?
            type: "Cantrip",
            damage: ["C", 8, "fire"],
            range: "60 ft",
            description: "20-ft radius bright light and 20-ft radius dim light until thrown",
            abilitytodamage: false
        });

        // define attack
        mpmb.AddWeapon("thunderwave", {
            regExpSearch: /^(?=.*thunderwave).*$/i,
            name: "Thunderwave",
            source: ['P24', 334],
            list: "spell",
            useSpellcastingAbility: false,
            ability: 2, // con
            type: "Spell",
            damage: [["2", 8, "thunder"], ["USL", 8, 'thunder']],
            range: "self 15-ft cube",
            description: "All crea/unsecured obj 2d8+1d8/SL Thunder, pushed 10 ft away; save 1/2 dmg only; audible 300ft",
            abilitytodamage: false,

            // attempt to extend the def. with what happens on save
            dc: ["Con", null, "takes half damage"],

            // todo: get rid of this
            save: ["Con", null, "takes half damage"]
        });

        // todo: is this a con save / wis save or what?
        // I think I need to review the convulted modifier calcs
        // from the attacks table
        // Word of Radiance | Yes | Wis | 5-ft. radius | DC 10 | 1d6 | Radiant
        // Con save, success - no damage; Only chosen creatures I can see are affected

        // What I'd like the card to say:
        // Each target within a 5-foot radius from you makes a Con saving throw (DC 10)
        // On failure, they are dealt 1d6 Radiant damage.
        // On success, they are dealt no damage.

        const radiance = WeaponsList["word of radiance"];
        console.debug(radiance);

        // todo: healing word
        // "1 creature heals 2d4+2d4/SL+5 (Wis) HP"

    }

    function ExtendSpellsList(SpellsList) {

        // spells are easier to work with, if they have a key property
        for (const [key, value] of Object.entries(SpellsList)) {
            value.key = key
        }
    }

    function SelectSpells(SpellsList) {

        let spells = [
            SpellsList['druidcraft'],
            SpellsList['elementalism'],
            SpellsList['produce flame'],
            SpellsList['shocking grasp'],
            SpellsList['detect magic'],
            SpellsList['find familiar'],
            SpellsList['healing word'],
            SpellsList['purify food and drink'],
            SpellsList['sleep'],
            SpellsList['speak with animals'],
            SpellsList['thunderwave'],
            SpellsList['augury'],
            SpellsList['locate animals or plants'],
            SpellsList['misty step'],
        ]

        // temp, so that I have a DC Save based attack to look at
        spells = [
            SpellsList['word of radiance'], ...spells
        ]

        // debug - grab everything, and see what happens


        // todo: filtering isn't working?
        // .filter(_ => {
        //     _.source[0] !== "LEGACYSPELLS"
        // })

        return spells;

    }

    function SelectAllSpells(list) {
        let spells = Object.values(SpellsList);
        spells = spells.filter(_ => {
            const allow = _.source[0][0] !== "LEGACYSPELLS"
            return allow;
        });
        return spells;
    }


    const pdf = {
        fields: {}
    }
    const dict = pdf.fields;

    // Guessing about fields names, since there's no documentation.
    // not working, this pointer jank?
    // Value('Character Level', 3);
    // Value('Wis Mod', +3);
    // Value('Prof Bonus', +2);

    dict['Character Level'] = 3;
    dict['Wis Mod'] = 3;
    dict['Prof Bonus'] = 2;
    dict['Spell Attack Bonus'] = dict['Prof Bonus'] + dict['Wis Mod'];
    dict['Spell Save DC'] = 8 + dict['Prof Bonus'] + dict['Wis Mod']

    // first pass
    for (spell of spells) {
        spell.upcastable = spell.description.includes('/SL');

        // link together the spell list and weapon list
        spell.action = WeaponsList[spell.key]

        spell.debug = {};
        spell.debug.applySpellcastingAbility = applySpellcastingAbility(spell, {
            // ability: 'Wis'
            ability: 5
        });
        spell.debug.GetSpellObject = GetSpellObject(spell.key, 'druid', false, true, true);
    }

    // build the dto for the spell caster stats
    const caster = {
        level: dict['Character Level'],
        spell_mod: dict['Wis Mod'],
        prof_mod: dict['Prof Bonus'],
        spell_attack_mod: dict['Spell Attack Bonus'],
        spell_save: dict['Spell Save DC'],
    }

    // build up view model that binds to the card
    for (spell of spells) {
        spell.vm = build_spellcard_vm(spell, caster)
    }

    // todo: pass a casting context
    // include things like the caster, upcasted spell slots,k bonuses, etc.
    function build_spellcard_vm(spell, caster) {
        const vm = {};

        // vm.title = ... ommitted - no need to format the spell title
        vm.subtitle = format_spell_subtitle(spell)

        vm.summary = format_spell_summary(spell, caster);

        vm.time = format_spell_time(spell);
        vm.range = format_spell_range(spell);
        vm.components = format_spell_components(spell);
        vm.duration = format_spell_duration(spell);

        vm.descriptionHtml = format_spell_description(spell);

        vm.source = format_spell_source(spell);

        return vm;
    }

    // https://github.com/morepurplemorebetter/2024_MPMBs-Character-Record-Sheet/tree/main/additional%20content%20syntax

    // schema definition for objects in WeaponsList:
    // https://github.com/morepurplemorebetter/2024_MPMBs-Character-Record-Sheet/blob/main/additional%20content%20syntax/weapon%20(WeaponsList).js

    // formats the spell's casting summary, resolving variables from the caster
    function format_spell_summary(spell, caster) {

        // example edge cases 
        // - 'Produce Flame' has two actions. The spell itself is a bonus action. But enables a magic attack action.
        //   Handled by stuffing the attack description in spell.action

        // we're stuffing all of the data in the spell.action property
        // not all spells have relevant summaries that need calulating
        // in which case, action isn't set - so just use the summary text from the spell sheet
        if (!spell.action) {
            return spell.description;
        }

        // todo
        // not worrying about upcasting for now.
        const spell_slot_size = spell.level

        const range = format_range(spell);
        const to_hit = format_modifier(caster.spell_attack_mod);
        const dice = `${format_damage_dice(spell, caster.level, spell_slot_size)}`;

        let text = ""
        if (spell.action.dc) {

            // attempt to parse out metadata for the spell save behavior
            // which I think was a custom extension I made?
            // If not available, then use the caster's spell save.

            let spell_save = caster.spell_save;
            let ability = (spell.action.save ? spell.action.save[0] : null) ?? format_ability(spell.action.ability)
            let fail_result = (spell.action.save ? spell.action.save[1] : null) // todo: haven't come across a fail result that needs templating yet.
            let save_result = (spell.action.save ? spell.action.save[2] : null) ?? "no"

            // todo: will eventually need to parameterize 'from you'
            let origin = "you"

            text = `Each target within a ${range} from ${origin} makes a DC ${spell_save} ${ability} saving throw.`

            // todo: will likely need to figure out a way to parameterize this.
            // I'm assuming all cantrips though, save in the same way.
            text = text + `\nOn failure, they take ${dice} damage.`
            text = text + `\nOn success, they take ${save_result} damage.`
        }
        else {

            text = `Make a ${range} spell attack (${to_hit} to hit); Deals ${dice} damage.`
        }

        return text;
    }

    function format_range(spell) {
        let range = "";
        const token = spell.action.range;

        const patterns = [

            // ex: `60 ft` => `60 foot ranged`
            {
                regex: /(\d+)\s*(ft|m)/i,
                handle: (amount, unit) => {
                    unit = unabbreviate(unit);
                    return `${amount} ${unit} ranged`
                }
            },

            // ex: `Melee` => `melee`
            {

                regex: /melee/i,
                handle: () => `melee`,
            },

            // ex: `5-ft radius` => `5 foot radius`
            {
                regex: /(\d+)-(.*) (.*)/i,
                handle: (amount, unit, shape) => {
                    unit = unabbreviate(unit);
                    return `${amount} ${unit} ${shape}`
                }
            },

            // ex: `S:15ft cube` => `15 foot cube`
            {
                regex: /S:(\d+)\s*(.*)\s(.*)/i,
                handle: (amount, unit, shape) => {
                    unit = unabbreviate(unit);
                    return `${amount} ${unit} ${shape}`
                }
            },
        ];

        for (const { regex, handle } of patterns) {
            const match = token.match(regex);
            if (match) {
                range = handle(...match.slice(1));
                return range;
            }
        }

        // for the default case, leave as-is but warn
        console.warn(`${spell.key}: Did not recognize spell range: ${token} `)
        return token;

    }

    function format_ability(text) {
        // if a number, then look uo the name
        return AbilityScores.names[spell.action.ability]

        // todo: handle other cases
    }

    // examples
    // [1, 8, Fire] => 1d8 Fire
    function format_damage_dice(spell, caster_level, spell_slot_size) {

        // allowing damage to be either an array or an multi-array
        // [dice_count, dice_size, damage_type]
        let damages = spell.action.damage;

        // if array, need to normalize into a multi-array 
        if (typeof (damages[0]) !== "object") {
            damages = [damages]
        }

        for (damage of damages) {

            let dice_count = damage[0];

            if (dice_count === 'C') {
                if (caster_level < 5) {
                    dice_count = 1;
                }
                else if (caster_level < 11) {
                    dice_count = 2;
                }
                else if (caster_level < 17) {
                    dice_count = 3;
                }
                else {
                    dice_count = 4;
                }
            }

            if (dice_count === 'USL') {
                // upcast spell level is the spell slot used - the default spell slot size
                const default_spell_slot_size = 1;
                dice_count = spell_slot_size - default_spell_slot_size
            }

            damage[0] = dice_count

            // let size = spell.action.damage[1];

            // todo: normalize damage type
            // let type = spell.action.damage[2];
        }

        // condense damage, by grouping together by dice_size and damage_type
        // then summing the dice_count

        let groupings = Map.groupBy(damages, x => JSON.stringify([x[1], x[2]]));
        damages = [...groupings.entries()].map(entry => {
            const key = JSON.parse(entry[0]);
            const sum = entry[1].map(x => x[0]).reduce((acc, val) => acc + val)
            const dice_size = key[0]
            const damage_type = key[1]
            const value = [sum, dice_size, damage_type]
            return value;
        });

        const damage_strings = damages.map(x => {
            const dice_count = x[0];
            const dice_size = x[1];
            const damage_type = x[2];
            return `${dice_count}d${dice_size} ${damage_type}`
        });

        return damage_strings.join(', ')

    }

    // format number with + or - sign prefix
    function format_modifier(amount) {
        if (amount >= 0) {
            return `+${amount}`
        }
        else {
            return `${amount}`
        }

    }


    function format_spell_subtitle(spell) {

        // todo: clean this up
        if (!spell.classes) {
            spell.classes = []
        }

        const school = toTitleCase(Base_spellSchoolList[spell.school]);
        const classes = `(${toTitleCase(spell.classes.join(', '))
            })`;

        if (spell.level === 0) {
            return `${school} Cantrip ${classes}`
        }
        else {
            return `Level ${spell.level}${spell.upcastable ? '+' : ''} ${school} ${classes}`
        }
    }

    function format_spell_time(spell) {
        let time = spell.time;
        time = time
            .replace(/\b1 a\b/i, 'Action')
            .replace(/bns\b/i, 'Bonus Action')
            .replace(/\bact\b/i, 'Action')
            .replace(/react\b/i, 'Reaction')
            .replace(/\b1 min\b/i, '1 minute')
            .replace(/\b1 h\b/i, '1 hour')
            .replace(/\bmin\b/i, 'minutes')
            .replace(/\bh\b/i, 'hours');

        if (spell.ritual) {
            time = time + " or Ritual"
        }

        return time;
    }

    function format_spell_range(spell) {
        const range = spell.range
            .replace(/s: *(.*)/i, "Self ($1)")
            .replace(/rad\b/i, "radius")
            .replace(/(\d+)(ft|m)/i, "$1-$2")
            .replace(/ft/, 'feet');
        return range;

    }

    // todo: some feats allow casting without components. should take that into consideration when formatting.
    // (render by striking this out?)
    function format_spell_components(spell) {

        let components = spell.components.replace(/,/g, ', ');
        ([components, is_costly] = replaceAndReport(components, /ƒ/, ''));
        ([components, is_consumed] = replaceAndReport(components, /†/, ''));

        if (spell.compMaterial) {

            let suffix = ''
            if (is_costly) {
                suffix = ' 💎'
            }
            else if (is_consumed) {
                suffix = ' 💎🔥'
            }

            return `${components}(${spell.compMaterial})${suffix}`
        }
        else {
            return components
        }
    }

    function format_spell_duration(spell) {
        let time = spell.duration;
        time = time
            .replace(/\b(conc), \b/i, '$1entration, up to ')
            .replace(/\b1 min\b/i, '1 minute')
            .replace(/\b1 h\b/i, '1 hour')
            .replace(/\bmin\b/i, 'minutes')
            .replace(/\bh\b/i, 'hours')
            .replace(/\(d\)/i, "(dismiss as 1 action)")
            .replace(/(instant)\./i, "$1aneous");
        return time;
    }

    function format_spell_description(spell) {

        return spell.descriptionFull

            // some descriptions are missing the bullet point, but are delimited with double space
            // lazy capture, but don't go too deep - we don't want to capture full sentences.
            .replace(/  (.{0,20}?\.)/g, "<b>   $1</b>")

            // regex will start at bullet point, and capture up to the first period.
            .replace(/•(.*?\.)/g, "<b>   $1</b>")
    }

    function format_spell_source(spell) {
        return stringSource(spell, "full,page,multi");
    }

    function toTitleCase(str) {
        if (!str) {
            return "";
        }
        return str
            .toLowerCase()
            .split(' ')
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

    function replaceAndReport(str, pattern, replacement) {
        let count = 0;
        const replaced = str.replace(pattern, (...args) => {
            count++;
            return typeof replacement === "function"
                ? replacement(...args)
                : replacement;
        });
        return [replaced, count];
    }

    // todo: this must have been defined elsewhere already
    function unabbreviate(text) {
        text = text.replace("ft", "foot");
        return text;
    }

    // Let's see if we have anything
    console.info(spells)

    // dump the informatkion i'm currently degguking
    // not found for some reason?
    // let temp = spells.find((spell) => {
    //     return spell.key === "thunderwave"
    // })
    // temp = spells[11]
    // console.info({ summary: temp.vm.summary, description: temp.vm.descriptionHtml })

    global.main = {
        spells: spells
    }

})(window)
