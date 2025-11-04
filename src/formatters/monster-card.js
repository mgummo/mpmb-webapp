(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    /** @type {BaseFormatter} */
    const TBaseFormatter = global.main.types.BaseFormatter;

    class MonsterCardFormatter extends TBaseFormatter {

        constructor() {
            super();
            this.attack_formatter = global.main.formatters.attack;
        }

        /**
         * @param {CreatureDefinition} monster
         */
        build_monstercard_vm(monster) {
            const vm = {}
            vm.size = this.format_creature_size(monster)
            vm.subtitle = this.format_subtitle(monster)

            // todo: option to roll for this
            vm.initiative = this.format_initiative(monster)

            // todo: option to roll for this
            vm.hit_dice = this.format_hit_dice(monster)

            vm.skills = this.format_skills(monster);
            vm.defenses = this.format_defenses(monster);
            vm.senses = this.format_senses(monster);
            vm.languages = this.format_languages(monster);

            vm.proficiencyBonus = this.format_modifier(monster.proficiencyBonus)

            vm.attacks = this.format_attacks(monster);

            vm.source = this.format_source_book(monster)

            return vm;
        }

        format_subtitle(monster) {
            const size = this.format_creature_size(monster);
            const type = this.format_creature_type(monster);
            const alignment = this.format_creature_alignment(monster);

            const text = `${size} ${type}, ${alignment}`;
            return text;
        }

        format_creature_size(monster) {

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

        format_creature_type(monster) {
            const type = monster.type.join(", ")
            const subtype = monster.subtype.join(", ")
            if (subtype) {
                return `$(type) ($subtype)`
            }
            else {
                return type
            }

        }

        format_creature_alignment(monster) {
            return monster.alignment;
        }

        format_initiative(monster) {
            const initiative = this.format_modifier(monster.abilities.dex.mod);
            const dex = monster.abilities.dex.score;
            return `${initiative} (${dex})`
        }

        format_hit_dice(monster) {

            const hit_dice_amount = monster.hd[0];
            const hit_dice_type = monster.hd[1];
            let hit_dice_mod = hit_dice_amount * monster.abilities.con.mod;
            hit_dice_mod = this.format_modifier(hit_dice_mod);

            const text = `(${hit_dice_amount}d${hit_dice_type}${hit_dice_mod})`
            return text;
        }

        format_skills(monster) {
            const fragments = []
            for (const [skill, mod] of Object.entries(monster.skills)) {
                fragments.push(`${this.toTitleCase(skill)} ${this.format_modifier(mod)}`)
            }
            const text = fragments.join(", ")
            return text;
        }

        format_defenses(monster) {

            const vulnerabilities = monster.defenses.damage_vulnerabilities.join(", ");
            const resistances = monster.defenses.damage_resistances.join(", ");

            const immunities = [
                monster.defenses.damage_immunities.join(", "),
                monster.defenses.condition_immunities.join(", ")
            ]
                .filter(token => token)
                .join("; ")

            const defenses = {
                vulnerabilities,
                resistances,
                immunities,
            };
            return defenses;
        }

        /**
         * @param {CreatureDefinition} monster
         */
        format_senses(monster) {
            const passive_perception = monster.abilities.wis.mod + 10;
            const text = [monster.senses, `Passive Perception ${passive_perception}`]
                .filter(token => token)
                .join("; ")
            return text;
        }

        format_languages(monster) {
            if (monster.languages == "") {
                return "None"
            }
            return monster.languages;
        }


        format_attacks(monster) {

            // I don't think we care about this variable? There should be already be a Multiattack action if applicable? 
            // const attackActions = monster.attacksAction;

            // todo: delegate to weapons formatter?
            const attacks = [];
            for (const attack of monster.attacks) {
                const range = this.attack_formatter.format_range(attack.range)
                const attack_skill = lookup_ability_by_index(attack.ability);
                const attack_mod = monster.abilities[attack_skill].mod + monster.proficiencyBonus;
                const damage_mod = monster.abilities[attack_skill].mod
                const damages = [
                    [attack.damage[0], attack.damage[1], damage_mod, attack.damage[2]]
                ];

                attacks.push({
                    name: attack.name,
                    range: range.type,
                    attack_mod: this.format_modifier(attack_mod),
                    reach: range.reach,
                    damage: this.attack_formatter.format_damage_expression(damages),
                    description: attack.description
                })

                if (monster.key == "giant squid") debugger;

            }

            return attacks;
        }

    }

    // lists: string[][]
    // returns string
    function joinLists(...lists) {
        return lists.flat().join(', ');
    }

    function lookup_ability_by_index(index) {
        switch (index) {
            case 1:
                return "str";
            case 2:
                return 'dex';
            case 3:
                return 'con';
            case 4:
                return 'int';
            case 5:
                return 'wis';
            case 6:
                return 'cha';
            default:
                throw "out of range"
        }
    }

    global.main.formatters.monster_card = new MonsterCardFormatter();


})(window)

