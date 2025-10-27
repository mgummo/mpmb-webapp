(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;

    const Mustache = global.Mustache;

    function load_template(name) {
        return document.getElementById(`${name}-template`)?.innerHTML
            .replaceAll('&gt;', '>');
    }

    function render(data, reflow_count) {
        const spells = data.spells;
        const spells_that_overflow = data.spells_that_overflow ?? [];
        const monsters = data.monsters;

        const templates = {
            "root": load_template("root"),
            "spell-card": load_template("spell-card"),
            "monster-card": load_template("monster-card"),
        };

        const vm = {
            sections: {
                "character-sheet": {
                },
                "spell-cards": {
                    pages: [
                        // { cards: spells, grid_size: null, },
                    ],
                },
                "monster-cards": {
                    pages: [
                        // { cards: monsters, grid_size: "3x3", },
                    ],
                },

            }
        };

        // group every 9 cards into a page
        (function () {
            const pages = vm.sections["spell-cards"].pages

            const cards_per_page = 9;
            const cards = spells;
            for (let i = 0; i < cards.length; i += cards_per_page) {
                const page = {
                    cards: cards.slice(i, i + cards_per_page),
                    grid_size: "3x3",
                };

                pages.push(page);
            }
        })();

        // group every 9 cards into a page
        (function () {
            const pages = vm.sections["monster-cards"].pages

            const cards_per_page = 9;
            const cards = monsters;
            for (let i = 0; i < cards.length; i += cards_per_page) {
                const page = {
                    cards: cards.slice(i, i + cards_per_page),
                    grid_size: "3x3",
                };

                pages.push(page);
            }
        })();

        // groups overflow cards into 4 / page
        // (so that they have more room, and shouldn't be overflowing the grid now)
        (function () {

            const pages = vm.sections["spell-cards"].pages

            const cards_per_page = 4;
            const cards = spells_that_overflow;
            for (let i = 0; i < cards.length; i += cards_per_page) {
                const page = {
                    cards: cards.slice(i, i + cards_per_page),
                    grid_size: "2x2",
                };

                pages.push(page);
            }

        })();


        // todo: experiment with [alpine](https://github.com/alpinejs/alpine)
        // looks like a vuejs-lite library, to replace mustache with 
        const html = Mustache.render(templates.root, vm, templates);
        document.getElementById("app").innerHTML = html;

        if (!reflow_count) {
            // todo: optimize this
            // [Violation] 'setTimeout' handler took 55ms
            window.setTimeout(() => {
                reflow(data);
            });
        }
    }





    function render_creatures(creatures) {

        console.info(`I have ${creatures.length} creatures to show.`);

        return;

        const cardTemplate = document.getElementById("monster-card-template").innerHTML;
        let cards = spells.map(spell => ({
            ...spell,
            html: global.Mustache.render(cardTemplate, spell)
        }));
    }


    function reflow(data) {
        const cards = findOverflowingCards();
        if (!cards.length) {
            return;
        }

        const spells = data.spells;

        const keys = new Set(cards.map(_ => _.dataset.key))
        const [spells_that_fit, spells_that_overflow] = spells.reduce((acc, spell) => {
            // maps bool to 0 or 1 (the group index)
            const group_index = +keys.has(spell.key);
            acc[group_index].push(spell);
            return acc;
        }, [[], []]);

        data.spells = spells_that_fit;
        data.spells_that_overflow = spells_that_overflow

        render(data);

    }

    function findOverflowingCards() {
        const cards = document.querySelectorAll('.spell-card');
        const overflowing = [];

        cards.forEach(card => {
            if (card.scrollHeight > card.clientHeight) {
                overflowing.push(card);
            }
        });

        console.log(`Found ${overflowing.length} overflowing cards.`);
        return overflowing;
    }

    // random junk

    function f(aSpell) {
        if (aSpell.descriptionCantripDie) {
            var cDie = cantripDie[Math.min(CurrentFeats.level, cantripDie.length) - 1];
            var newCantripDieDescr = isMetric && aSpell.descriptionCantripDieMetric ? aSpell.descriptionCantripDieMetric : aSpell.descriptionCantripDie;
            var rxCanDie = /`CD([\-+*] *\d *\.?\d *)`/;
            var execCanDie = rxCanDie.exec(newCantripDieDescr);
            while (execCanDie !== null) {
                var aDie = execCanDie[1].indexOf("*") !== -1 ? cDie * Number(execCanDie[1].replace("*", "")) : cDie + Number(execCanDie[1]);
                newCantripDieDescr = newCantripDieDescr.replace(execCanDie[0], Math.round(aDie));
                execCanDie = rxCanDie.exec(newCantripDieDescr);
            }
            aSpell.description = newCantripDieDescr.replace(/\b0d\d+/g, "0");
            if (isMetric && !aSpell.descriptionCantripDieMetric) {
                aSpell.description = ConvertToMetric(aSpell.description, 0.5);
            }
        }
        // apply ability score modifier or check
        var spellAbiDescr = applySpellcastingAbility(aSpell, aCast);
        if (spellAbiDescr) {
            aSpell.descriptionBeforeamendSpDescr = aSpell.description;
            aSpell.amendSpDescrCaster = theCast;
            aSpell.description = spellAbiDescr;
        }
    }

    global.main.render = render

    // Name          Prof?   Ability Range TO HIT DAMAGE DAMAGE TYPE
    // Produce Flame :check: Wis     60ft  +5     1d8    Fire

    // Make a 60 foot ranged spell attack (+5 to hit); Deals 1d8 Fire damage.

    // looks like the description is out-of-date?
    // 10-ft. radius bright light and 10-ft. radius dim light until thrown

    // "Flame emits 20ft rad bright light/20ft dim; 1 a 60ft ranged spell atk for 1d8 Fire; +1d8 at CL 5, 11, & 17"
    // "Flame emits 20ft rad bright light/20ft dim; 1 a 60ft ranged spell atk for `CD`d8 Fire dmg"
    //

    // todo: clean this up
    // can't figure out how GetSpellObject works
    // spell.temp2;

})(window)