(function (global) {

    function render(spells) {

        // render the cards
        const cardTemplate = document.getElementById("spell-card-template").innerHTML;
        const spellsWithHTML = spells.map(spell => ({
            ...spell,
            cardHTML: Mustache.render(cardTemplate, spell)
        }));

        // groups cards into pages of 9
        const cards_per_page = 9;
        let pages = [];
        for (let i = 0; i < spellsWithHTML.length; i += cards_per_page) {
            pages.push({ spells: spellsWithHTML.slice(i, i + cards_per_page) });
        }

        // render the pages
        const pageTemplate = document.getElementById("page-template").innerHTML;
        const rendered = Mustache.render(pageTemplate, { pages });
        document.getElementById("app").innerHTML = rendered;

        function findOverflowingCards() {
            const cards = document.querySelectorAll('.spell-card');
            const overflowing = [];

            cards.forEach(card => {
                if (card.scrollHeight > card.clientHeight) {
                    // card.style.borderColor = 'red'; // mark visibly
                    overflowing.push(card);
                }
            });

            console.log(`Found ${overflowing.length} overflowing cards.`);
            return overflowing;
        }

        // Run after render
        window.setTimeout(() => {
            const overflows = findOverflowingCards();

            // Example: move overflowing cards to a new section
            if (overflows.length) {
                const overflowContainer = document.createElement('div');
                overflowContainer.className = 'page overflow-page';
                document.body.appendChild(overflowContainer);

                overflows.forEach(card => {
                    const clone = card.cloneNode(true);
                    overflowContainer.appendChild(clone);
                    card.remove();
                    // card.style.opacity = 0.3; // visually mark duplicates
                });
            }

            // todo: reflow
            // fix here would be to move the cards out of the pages array.
            // then rebuild it.

            // that will also allow us to page the overflow cards, which fixes layout
            // when too many cards overflow

        });
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