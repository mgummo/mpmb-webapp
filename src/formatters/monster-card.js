(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;

    /** type MpmbApp */
    const mpmb = global.mpmb;

    class MonsterCardFormatter {

        build_monstercard_vm(monster) {
            const vm = {}
            vm.size = this.format_creature_size(monster)

            return vm;
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

    }

    global.main.formatters.monster_card = new MonsterCardFormatter();


})(window)