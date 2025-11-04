(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    /** @type {BaseFormatter} */
    const TBaseFormatter = global.main.types.BaseFormatter;

    class SpellCardFormatter extends TBaseFormatter {

        constructor() {
            super();
            this.format_range = global.main.formatters.attack.format_range;
            this.format_damage_dice = global.main.formatters.attack.format_damage_dice;
        }

        // todo: pass a casting context
        // include things like the caster, upcasted spell slots,k bonuses, etc.
        /**
         * 
         * @param {*} spell 
         * @param {Character} character
         * @param {SpellCasterStats} stats
         * @param {*} casting_context 
         * @returns 
         */
        build_spellcard_vm(spell, character, stats, casting_context) {
            const vm = {};

            // vm.title = ... ommitted - no need to format the spell title
            vm.subtitle = this.format_spell_subtitle(spell)

            vm.summary = this.format_spell_summary(spell, character, stats);

            vm.time = this.format_spell_time(spell);
            vm.range = this.format_spell_range(spell);
            vm.components = this.format_spell_components(spell);
            vm.duration = this.format_spell_duration(spell);

            vm.descriptionHtml = this.format_spell_description(spell);

            vm.source = this.format_source_book(spell);

            return vm;
        }

        // formats the spell's casting summary, resolving variables from the caster
        /**
         * 
         * @param {SpellDefinition} spell 
         * @param {SpellCasterStats} stats 
         * @returns 
         */
        format_spell_summary(spell, character, stats) {

            // todo: handle multiclass case
            let spell_save = stats.spell_save;
            let spell_attack_mod = stats.spell_attack_mod;

            // example edge cases 
            // - 'Produce Flame' has two actions. The spell itself is a bonus action. But enables a magic attack action.
            //   Handled by stuffing the attack description in spell.action

            // we're stuffing all of the data in the spell.action property
            // not all spells have relevant summaries that need calulating
            // in which case, action isn't set - so just use the summary text from the spell sheet
            if (!spell.action) {
                const result = this.unabbreviate(spell.description);
                return result;
            }

            // todo
            // not worrying about upcasting for now.
            const spell_slot_size = spell.level

            const range = this.format_range(spell.action.range);
            const to_hit = this.format_modifier(spell_attack_mod);

            const damages = spell.action.damage;
            const attack_context = {
                caster_level: character.level,
                spell_slot_size: spell_slot_size,
            };

            const dice = `${this.format_damage_dice(damages, attack_context)}`;

            let text = ""
            if (spell.action.dc) {

                // attempt to parse out metadata for the spell save behavior
                // which I think was a custom extension I made?
                // If not available, then use the caster's spell save.

                let unformatted_ability = (spell.action.save?.at(0) ?? spell.action.ability);

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

        format_spell_subtitle(spell) {

            const dict = mpmb.lists.spellSchoolList;

            const school = this.toTitleCase(dict[spell.school]);
            const classes = `(${this.toTitleCase(spell.classes.join(', '))
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

        format_spell_time(spell) {
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

        format_spell_range(spell) {
            const range = spell.range
                .replace(/s: *(.*)/i, "Self ($1)")
                .replace(/rad\b/i, "radius")
                .replace(/(\d+)(ft|m)/i, "$1-$2")
                .replace(/ft/, 'feet');
            return range;

        }

        // todo: some feats allow casting without components. should take that into consideration when formatting.
        // (render by striking this out?)
        format_spell_components(spell) {

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

        format_spell_duration(spell) {
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

        format_spell_description(spell) {

            let text = mpmb.formatDescriptionFull(spell.descriptionFull, false);

            return text

                // In case the `>> <<` format wasn't used...

                // some descriptions are missing the bullet point, but are delimited with double space
                // lazy capture, but don't go too deep - we don't want to capture full sentences.
                .replace(/  (.{0,20}?\.)/g, "<b>   $1</b>")

                // regex will start at bullet point, and capture up to the first period.
                .replace(/•(.*?\.)/g, "<b>   $1</b>")
        }

    }

    global.main.formatters.spell_card = new SpellCardFormatter();

})(window)