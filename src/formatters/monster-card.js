(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    /** @type {BaseFormatter} */
    const TBaseFormatter = global.main.types.BaseFormatter;

    class MonsterCardFormatter extends TBaseFormatter {

        build_monstercard_vm(monster) {
            const vm = {}
            vm.size = this.format_creature_size(monster)
            vm.subtitle = this.format_subtitle(monster)

            // todo: option to roll for this
            vm.initiative = this.format_initiative(monster)

            // todo: option to roll for this
            vm.hit_dice = this.format_hit_dice(monster)

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

    }

    global.main.formatters.monster_card = new MonsterCardFormatter();


})(window)