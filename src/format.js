(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;

    /** type MpmbApp */
    const mpmb = global.mpmb;

    // todo: pass a casting context
    // include things like the caster, upcasted spell slots,k bonuses, etc.
    /**
     * 
     * @param {*} spell 
     * @param {Character} caster 
     * @param {*} casting_context 
     * @returns 
     */
    function build_spellcard_vm(spell, caster, casting_context) {
        const vm = {};

        // vm.title = ... ommitted - no need to format the spell title
        vm.subtitle = format_spell_subtitle(spell)

        vm.summary = format_spell_summary(spell, caster.class);

        vm.time = format_spell_time(spell);
        vm.range = format_spell_range(spell);
        vm.components = format_spell_components(spell);
        vm.duration = format_spell_duration(spell);

        vm.descriptionHtml = format_spell_description(spell);

        vm.source = format_spell_source(spell);

        return vm;
    }

    function build_monstercard_vm(monster) {
        const vm = {}
        vm.size = format_creature_size(monster)

        return vm;
    }

    // formats the spell's casting summary, resolving variables from the caster
    /**
     * 
     * @param {*} spell 
     * @param {SpellCaster} caster 
     * @returns 
     */
    function format_spell_summary(spell, caster) {

        // todo: handle multiclass case
        let spell_save = caster.spell_save;
        let spell_attack_mod = caster.spell_attack_mod;

        // example edge cases 
        // - 'Produce Flame' has two actions. The spell itself is a bonus action. But enables a magic attack action.
        //   Handled by stuffing the attack description in spell.action

        // we're stuffing all of the data in the spell.action property
        // not all spells have relevant summaries that need calulating
        // in which case, action isn't set - so just use the summary text from the spell sheet
        if (!spell.action) {
            const result = unabbreviate(spell.description);
            return result;
        }

        // todo
        // not worrying about upcasting for now.
        const spell_slot_size = spell.level

        const range = format_range(spell);
        const to_hit = format_modifier(spell_attack_mod);
        const dice = `${format_damage_dice(spell, caster.level, spell_slot_size)}`;

        let text = ""
        if (spell.action.dc) {

            // attempt to parse out metadata for the spell save behavior
            // which I think was a custom extension I made?
            // If not available, then use the caster's spell save.

            let unformatted_ability = (spell.action.save?.at(0) ?? spell.action.ability);

            let ability = format_ability(unformatted_ability);
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

            "Make a 30 foot reach Melee spell attack"
            "Make a 30 foot ranged spell attack"

            text = `Make a ${range} spell attack (${to_hit} to hit); Deals ${dice} damage.`
        }

        return text;
    }

    function format_range(spell) {

        let range = "";
        const token = spell.action.range;

        const patterns = [

            // ex: `30 ft Melee` => `30 foot Melee`
            {
                regex: /(\d+)\s*(ft|m) melee/i,
                handle: (amount, unit) => {
                    unit = unabbreviate(unit);
                    return `${amount} ${unit} Melee`
                }
            },

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

            // ex: `Touch` => `touch`
            {

                regex: /touch/i,
                handle: () => `touch`,
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
        switch (text) {
            case 1:
                return "Str";
            case 2:
                return 'Dex';
            case 3:
                return 'Con';
            case 4:
                return 'Int';
            case 5:
                return 'Wis';
            case 6:
                return 'Cha';
            default:
                return text;
        }
    }

    // examples
    // [1, 8, Fire] => 1d8 Fire
    function format_damage_dice(spell, caster_level, spell_slot_size) {

        // todo: why is this sometimes null - I thought I normalized everything.
        let damages = spell.action.damages ?? []

        for (let damage of damages) {

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

        const dict = mpmb.lists.spellSchoolList;

        const school = toTitleCase(dict[spell.school]);
        const classes = `(${toTitleCase(spell.classes.join(', '))
            })`;

        let line1 = "";
        let line2 = "";
        if (spell.level === 0) {
            line1 = `${school} Cantrip ${classes}`
        }
        else {
            line1 = `Level ${spell.level}${spell.upcastable ? '+' : ''} ${school} ${classes}`
        }

        if (spell.always_prepared) {
            line2 = `Always Prepared: ${spell.always_prepared.because}`
        }

        // join lines together, filtering out falsey lines.
        return [line1, line2].filter(Boolean).join("\n")
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
        let is_costly = false;
        let is_consumed = false;

        [components, is_costly] = replace_and_report(components, /ƒ/, '');
        [components, is_consumed] = replace_and_report(components, /†/, '');

        if (spell.compMaterial) {

            let icons = ''
            if (is_costly) {
                icons = '💎 '
            }
            else if (is_consumed) {
                icons = '🔥💎 '
            }

            return `${components} (${icons}${spell.compMaterial})`
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

        let text = mpmb.formatDescriptionFull(spell.descriptionFull, false);

        return text

            // In case the `>> <<` format wasn't used...

            // some descriptions are missing the bullet point, but are delimited with double space
            // lazy capture, but don't go too deep - we don't want to capture full sentences.
            .replace(/  (.{0,20}?\.)/g, "<b>   $1</b>")

            // regex will start at bullet point, and capture up to the first period.
            .replace(/•(.*?\.)/g, "<b>   $1</b>")
    }

    function format_spell_source(spell) {
        return mpmb.stringSource(spell, "full,page,multi");
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

    // init the glossary at startup
    const glossary = Object.fromEntries([
        ["ft", "foot"],
        ["gal", "gallons"],
        ["hr", "hour"],
        ["hrs", "hours"],
        ["cu", "cube"],
        ["crea", "creature"],
        ['obj', 'object'],
        ["chks", "checks"],
        ['Ath', 'Athletics'],
        ["adv", "advantage"],   //todo: this is actually abbreviated as adv. but regex matching is failing on period.
        ["dmg", "damage"],
        ["wea", "weapon"],
        ["atk", 'attack'],
        ["qtrstaff", "Quarterstaff"],
        ["1 a", "1 action"],    // todo: regex isn't matching this because of the space
        ['bns ', 'Bonus Action'],
        ['dif. ter.', 'Difficult Terrian'], // todo: not working
        ['cons', 'consumed'],
        ['see B', '']           // no need to see book, full details are on card // todo: implement this
    ]);

    // get the abbreviations, and escape them for regex
    const escaped_abbreviations = Object.keys(glossary)
        .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    // build up a regex that matches on those abbreviations
    const regex = new RegExp(`\\b(${escaped_abbreviations.join("|")})\\b`, "gi");

    // todo: confirm this function isn't defined elsewhere, in mpmb repo
    /**
     * Expands the given text by searching for and replacing abbreviations.
     * 
     * @param {string} text
     */
    function unabbreviate(text) {
        text = text ?? "";
        const result = text.replace(regex, match => glossary[match] ?? match);
        return result;
    }

    global.main.build_spellcard_vm = build_spellcard_vm;
    global.main.build_monstercard_vm = build_monstercard_vm;

})(window)

function format_creature_size(monster) {

    const sizes = monster.size.map(value => {
        switch (value) {
            case 0: return "Gargantuan";
            case 1: return "Huge"
            case 2: return "Large"
            case 3: return "Medium"
            case 4: return "Small"
            case 5: return "Tiny"
            default: return "?"
        }
    });
    return sizes.join(" / ")
}

