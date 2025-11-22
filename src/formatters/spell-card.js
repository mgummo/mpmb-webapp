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
            this.attack_formatter = global.main.formatters.attack;
        }

        // todo: pass a casting context
        // include things like the caster, upcasted spell slots,k bonuses, etc.
        /**
         * 
         * @param {*} spell 
         * @param {Character} character - who is casting the spell?
         * @param {SpellCasterStats} stats - which character class is being used to cast the spell?
         * @param {*} casting_context - any modifiers to how the spell is being cast? (upcasting, etc.)
         * @returns 
         */
        build_spellcard_vm(spell, character, stats, casting_context) {
            const vm = {};

            // vm.title = ... ommitted - no need to format the spell title
            vm.subtitle = this.format_spell_subtitle(spell)

            vm.time = this.format_spell_time(spell);
            vm.range = this.format_spell_range(spell);
            vm.components = this.format_spell_components(spell);
            vm.duration = this.format_spell_duration(spell);

            vm.description = {
                concise: this.format_spell_summary(spell, character, stats),
                summary: this.format_spell_description(spell),
            }

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
                const result = this.unabbreviate(spell.description.concise);
                return result;
            }

            // the spell defines an action property. format that for the spell's concise description.
            if (spell.level == 0) {
                let result = this.unabbreviate(spell.description.concise)
                const dice_amount = this.attack_formatter.get_cantrip_dice_amount(character.level);
                result = result.replace('`CD`', dice_amount);
                return result;
            }

            // todo: none of the below works
            // I don't have the spell metadata available to do what I want

            const spell_slot_size = spell.level

            const range = this.attack_formatter.format_range(spell.action.range).reach;
            const to_hit = this.format_modifier(spell_attack_mod);

            const damages = spell.action.damage;
            const attack_context = {
                caster_level: character.level,
                spell_slot_size: spell_slot_size,
            };

            const dice = `${this.attack_formatter.format_damage_dice(damages, attack_context)}`;

            let text = "";
            if (spell.action.dc) {

                const dc = spell.action.dc

                // attempt to parse out metadata for the spell save behavior
                // which I think was a custom extension I made?
                // If not available, then use the caster's spell save.

                // let unformatted_ability = (spell.action.dc?.at(0) ?? spell.action.ability);
                let unformatted_ability = dc[0];
                let ability = this.format_ability(unformatted_ability);
                
                let fail_result = dc[2];
                let save_result = dc[3];

                // todo: will eventually need to parameterize 'from you'
                let origin = "you"

                text = 
                    `Deals ${dice} damage; ` +
                    `Each target within a ${range} from ${origin} makes a DC ${spell_save} ${ability} saving throw.\n` +
                    `Failure: ${fail_result}\n` +
                    `Success: ${save_result}\n`
            }
            else {

                // "Make a 30 foot reach Melee spell attack"
                // "Make a 30 foot ranged spell attack"

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
                line1 = `Level ${spell.level}${spell.allowUpCasting ? '+' : ''} ${school} ${classes}`
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

            let text = ""

            if (spell.description.summary) {
                text = spell.description.summary;
                var converter = new global.showdown.Converter();
                const html = converter.makeHtml(text);
                return html;
            }

            text = mpmb.formatDescriptionFull(spell.description.full, false);

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