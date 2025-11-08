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

            vm.subtitle = this.format_subtitle(monster);

            // todo: option to roll for this
            vm.initiative = this.format_initiative(monster)

            // todo: option to roll for this
            vm.hit_dice = this.format_hit_dice(monster)

            vm.skills = this.format_skills(monster);
            vm.defenses = this.format_defenses(monster);
            vm.gear = monster.gear.join(", ");
            vm.senses = this.format_senses(monster);
            vm.languages = this.format_languages(monster);
            vm.pb = this.format_modifier(monster.pb)

            vm.traits = this.format_attacks(monster, monster.features.traits);
            vm.attacks = this.format_attacks(monster, monster.features.attacks);

            vm.features = {
                actions: this.format_attacks(monster, monster.features.actions),
                bonus_actions: monster.features.bonus_actions,
                reactions: monster.features.reactions,
            }

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

            if (monster.size == null) {
                return null;
            }

            const sizes = monster.size.map(value => {
                switch (value) {
                    case 0: return "Gargantuan";
                    case 1: return "Huge"
                    case 2: return "Large"
                    case 3: return "Medium"
                    case 4: return "Small"
                    case 5: return "Tiny"
                    default: return value.toTitleCase()
                }
            });
            return sizes.join(" / ")
        }

        format_creature_type(monster) {

            if (!monster.type) { return null }


            const type = monster.type.map(_ => _.toTitleCase()).join(", ")
            const subtype = monster.subtype.map(_ => _.toTitleCase()).join(", ")
            if (subtype) {
                return `${type} (${subtype})`
            }
            else {
                return type
            }

        }

        format_creature_alignment(monster) {

            if (!monster.alignment) { return null; }

            return monster.alignment.toTitleCase();
        }

        format_initiative(monster) {
            if (!monster.abilities) {
                return undefined;
            }

            const initiative_mod = this.format_modifier(monster.abilities.dex.mod);
            const initiative_average = 10 + monster.abilities.dex.mod;
            return `${initiative_mod} (${initiative_average})`
        }

        format_hit_dice(monster) {

            if (!monster.abilities) {
                return undefined;
            }

            const hit_dice_amount = monster.hd[0];
            const hit_dice_type = monster.hd[1];
            let hit_dice_mod = hit_dice_amount * monster.abilities.con.mod;
            hit_dice_mod = this.format_modifier(hit_dice_mod);

            const text = `(${hit_dice_amount}d${hit_dice_type}${hit_dice_mod})`
            return text;
        }

        format_skills(monster) {

            if (!monster.skills) { return null }

            const fragments = []
            for (const [skill, mod] of Object.entries(monster.skills)) {
                fragments.push(`${this.toTitleCase(skill)} ${this.format_modifier(mod)}`)
            }
            const text = fragments.join(", ")
            return text;
        }

        format_defenses(monster) {

            if (!monster.defenses) { return null; }

            const vulnerabilities = monster.defenses.damage_vulnerabilities
                .map(_ => _.toTitleCase())
                .join(", ");
            const resistances = monster.defenses.damage_resistances
                .map(_ => _.toTitleCase())
                .join(", ");

            const immunities = [
                monster.defenses.damage_immunities
                    .map(_ => _.toTitleCase())
                    .join(", "),
                monster.defenses.condition_immunities
                    .map(_ => _.toTitleCase())
                    .join(", ")
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
            if (!monster.abilities) {
                return undefined;
            }

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


        // todo: delegate to weapons formatter?
        format_attacks(monster, attacks) {

            if (!attacks) return []

            // I don't think we care about this variable? There should be already be a Multiattack action if applicable? 
            // const attackActions = monster.attacksAction;

            const result = [];
            for (const attack of attacks) {

                // might be a non attack trait
                if (!attack.range) {
                    attack.type = "";
                    result.push(attack)
                    continue;
                }

                const range = this.attack_formatter.format_range(attack.range)

                const type = this._compute_attack_type(range, attack.dc)

                const vm = { ...attack };
                vm.type = type;
                vm.range = range.reach
                vm.recharge = this._format_recharge(attack);

                const damages = attack.damage;
                if (!attack.dc) {

                    if (!attack.ability) {
                        result.push(attack)
                        continue;
                    }

                    const attack_skill = lookup_ability_by_index(attack.ability);
                    const attack_mod = monster.abilities[attack_skill].mod + monster.pb + attack.modifiers[0]
                    const damage_mod = monster.abilities[attack_skill].mod + attack.modifiers[1]

                    const attack_context = {
                        attack_mod,
                        damage_mod,
                    }

                    let on_hit = "";
                    if (damages) {

                        const fragment = this.attack_formatter.format_damage_expression(damages, attack_context)
                        on_hit = `${fragment} damage.`
                    }

                    vm.attack_mod = this.format_modifier(attack_mod);
                    vm.on_hit = on_hit;
                }
                else {
                    vm.dc = `DC ${attack.dc[1]}`

                    if (damages?.length) {

                        const attack_context = (function () {
                            if (attack.ability) {
                                const attack_skill = lookup_ability_by_index(attack.ability);
                                const attack_mod = monster.abilities[attack_skill].mod + monster.pb + attack.modifiers[0]
                                const damage_mod = monster.abilities[attack_skill].mod + attack.modifiers[1]

                                return {
                                    attack_mod,
                                    damage_mod,
                                }
                            }
                            else {
                                return {}
                            }
                        })()



                        vm.damage = `${this.attack_formatter.format_damage_expression(damages, attack_context)} damage.`
                    }

                    vm.on_save_failure = attack.dc[2];
                    vm.on_save_success = attack.dc[3];
                }

                result.push(vm);
            }

            return result;
        }

        // "Melee Attack Roll"
        // "Range Attack Roll"
        // "Wisdom Saving Throw"
        _compute_attack_type(range, save) {
            if (save) {
                const ability = this._format_ability_name(save[0]);
                return `${ability} Saving Throw`
            }
            else return `${range.type} Roll`;
        }

        _format_ability_name(text) {
            switch (text) {
                case 1:
                case 'str':
                    return "Strength";
                case 2:
                case 'dex':
                    return 'Dexterity';
                case 3:
                case 'con':
                    return 'Constitution';
                case 4:
                case 'int':
                    return 'Intelligence';
                case 5:
                case 'wis':
                    return 'Wisdom';
                case 6:
                case 'cha':
                    return 'Charisma';
                default:
                    return text;
            }
        }

        _format_recharge(attack) {
            if (!attack.recharge) {
                return null;
            }

            if (attack.recharge.length == 1) {
                return ` (Recharge ${attack.recharge[0]})`
            }
            else if (attack.recharge.length == 2) {
                return ` (Recharge ${attack.recharge[0]}-${attack.recharge[1]})`
            }
            else {
                return ` Recharge ${attack.recharge}`
            }

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
            case 'str':
            case 'Str':
                return "str";
            case 2:
            case 'dex':
            case 'Dex':
                return 'dex';
            case 3:
            case 'con':
            case 'Con':
                return 'con';
            case 4:
            case 'int':
            case 'Int':
                return 'int';
            case 5:
            case 'wis':
            case 'Wis':
                return 'wis';
            case 6:
            case 'cha':
            case 'Cha':
                return 'cha';
            default:
                throw "out of range"
        }
    }

    global.main.formatters.monster_card = new MonsterCardFormatter();


})(window)

