(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    const BaseFormatter = global.main.types.BaseFormatter;

    class AttackFormatter extends BaseFormatter {

        /**
         * @param {Weapon} attack
         * @param {*} attacker 
         * 
         */
        format_attack(spell, attack, attacker) {

            let spell_save = attacker.spell_save;
            let spell_attack_mod = attacker.spell_attack_mod;

            const range = this.format_range(spell);
            const to_hit = this.format_modifier(spell_attack_mod);

            if (!spell.action.damages) { debugger; }
            const damages = spell.action.damages;
            const attack_context = {
                caster_level: attacker.caster_level,
                spell_slot_size: attacker.spell_slot_size,
            };

            const dice = `${this.format_damage_dice(damages, attack_context)}`;

            let text = ""
            if (attack.dc) {

                // attempt to parse out metadata for the spell save behavior
                // which I think was a custom extension I made?
                // If not available, then use the caster's spell save.

                let unformatted_ability = (attack.save?.at(0) ?? attack.ability);

                let ability = this.format_ability(unformatted_ability);
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

        format_range(token) {

            let range = "";

            const patterns = [

                // ex: `30 ft Melee` => `30 foot Melee`
                {
                    regex: /(\d+)\s*(ft|m) melee/i,
                    handle: (amount, unit) => {
                        unit = this.unabbreviate(unit);
                        return `${amount} ${unit} Melee`
                    }
                },

                // ex: `Melee (5 ft)` => ['Melee Attack', 'reach 5 ft']
                {
                    regex: /Melee \((\d+)\s*(ft|m)\)/,
                    handle: (amount, unit) => {
                        return {
                            type: "Melee Attack",
                            reach: `reach ${amount} ${unit}`,
                        }
                    }
                },

                // ex: `80/320 ft` => range 80/320 ft
                {
                    regex: /(d+)\\(d+)\s*(ft|m)/,
                    handle: (short_range, long_range, unit) => {
                        return `range ${short_range}/${long_range} {unit}`
                    }
                },

                // ex: `60 ft` => `60 foot ranged`
                {
                    regex: /(\d+)\s*(ft|m)/i,
                    handle: (amount, unit) => {
                        unit = this.unabbreviate(unit);
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
                        unit = this.unabbreviate(unit);
                        return `${amount} ${unit} ${shape}`
                    }
                },

                // ex: `S:15ft cube` => `15 foot cube`
                {
                    regex: /S:(\d+)\s*(.*)\s(.*)/i,
                    handle: (amount, unit, shape) => {
                        unit = this.unabbreviate(unit);
                        return `${amount} ${unit} ${shape}`
                    }
                },

                {
                    regex: /One in shared area/i,
                    handle: () => {
                        // "one Medium or smaller creature in this creature's space"
                        return "one creature in this creature's space"
                    }
                },

                {
                    regex: /All in shared area/i,
                    handle: () => {
                        return "each creature in this creature's space"
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

            // todo: should include the key or attack in the warning
            // for the default case, leave as-is but warn
            console.warn(`Did not recognize spell range: ${token} `)
            debugger;
            return token;

        }

        /**
         * @param {DamageExpression} damages 
         * @param {*} attack_context 
         * @returns 
         * @example        
         * [1, 8, 2, fire] => (1d8 + 2) Fire
         */
        format_damage_expression(damages, attack_context) {

            let resolved_damages = this._ResolveVariables(damages, attack_context);
            resolved_damages = this._AggregateDamageTypes(resolved_damages);

            const damage_strings = damages.map(x => {
                const dice_count = x[0];
                const dice_size = x[1];

                let damage_mod = x[2]
                if (!damage_mod) {
                    damage_mod = ""
                }
                else {
                    damage_mod = this.format_modifier(damage_mod)
                }

                const damage_type = x[3].toTitleCase();

                return `(${dice_count}d${dice_size}${damage_mod}) ${damage_type}`
            });

            return damage_strings.join(', ')
        }

        _ResolveVariables(damages, attack_context) {

            const caster_level = attack_context?.caster_level;
            const spell_slot_size = attack_context?.spell_slot_size

            const result = damages.map(damage => {

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

                // todo: resolve the modifier also?
                let damage_mod = damage[2]

                return [dice_count, damage[1], damage_mod, damage[3]]
            });



            return result;
        }

        _AggregateDamageTypes(damages) {
            // condense damage, by grouping together by dice_size and damage_type
            // then summing the dice_count

            let groupings = Map.groupBy(damages, x => JSON.stringify([x[1], x[3]]));
            const result = [...groupings.entries()].map(entry => {
                const key = JSON.parse(entry[0]);
                const sum = entry[1].map(x => x[0]).reduce((acc, val) => acc + val)
                const dice_size = key[0]
                const damage_type = key[1]
                const value = [sum, dice_size, damage_type]
                return value;
            });
            return result
        }

        /**
         * // todo: prefer other function
         * @param {DamageDice} damages 
         * @param {*} attack_context 
         * @returns 
         * @example
         * [1, 8, Fire] => 1d8 Fire
         */
        format_damage_dice(damages, attack_context) {

            const caster_level = attack_context?.caster_level;
            const spell_slot_size = attack_context?.spell_slot_size

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
                const damage_type = key[1].toTitleCase()
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
    }

    global.main.formatters.attack = new AttackFormatter();
})(window)



