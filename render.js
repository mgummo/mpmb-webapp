(function (global) {

    function render(spells) {

        renderHelper(spells);

        // next tick
        window.setTimeout(() => {
            reflow();
        });
    }

    function renderHelper(spells, overflowing_spells) {

        const pages = [];

        overflowing_spells = overflowing_spells ?? []

        // render the cards
        const cardTemplate = document.getElementById("spell-card-template").innerHTML;
        let spellsWithHTML = spells.map(spell => ({
            ...spell,
            cardHTML: Mustache.render(cardTemplate, spell)
        }));

        // groups cards into 9 / page
        let cards_per_page = 9;
        for (let i = 0; i < spellsWithHTML.length; i += cards_per_page) {
            pages.push({
                spells: spellsWithHTML.slice(i, i + cards_per_page),
                grid_size: "3x3",
            });
        }

        spellsWithHTML = overflowing_spells.map(spell => ({
            ...spell,
            cardHTML: Mustache.render(cardTemplate, spell)
        }));

        // groups overflow cards into 4 / page
        // (so that they have more room, and shouldn't be overflowing the grid now)
        cards_per_page = 4;
        for (let i = 0; i < spellsWithHTML.length; i += cards_per_page) {
            pages.push({
                spells: spellsWithHTML.slice(i, i + cards_per_page),
                grid_size: "2x2",
            });
        }

        // render the pages
        const pageTemplate = document.getElementById("page-template").innerHTML;
        const rendered = Mustache.render(pageTemplate, { pages });
        document.getElementById("app").innerHTML = rendered;

    }

    function reflow() {
        const cards = findOverflowingCards();
        if (!cards.length) {
            return;
        }

        const keys = new Set(cards.map(_ => _.dataset.key))
        const [spells_that_fit, spells_that_overflow] = spells.reduce((acc, spell) => {
            // maps bool to 0 or 1 (the group index)
            const group_index = +keys.has(spell.key);
            acc[group_index].push(spell);
            return acc;
        }, [[], []]);

        renderHelper(spells_that_fit, spells_that_overflow);

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

    global.page = {
        render: render
    }

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