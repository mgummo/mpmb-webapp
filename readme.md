# MPMB Web App

A lightweight web app for viewing and printing information from the [MorePurpleMoreBetter D&D Character Sheet](https://github.com/morepurplemorebetter/2024_MPMBs-Character-Record-Sheet).

> ⚠️ **Prototype:** This project is in early development and may change frequently.

## Features

- **Simple setup** — no Node.js, bundlers, or build steps required. Just minimal editing of config files.
- ⚠️ **Character stats** not yet implemented
- **Spell cards** — formatted to be printer friendly.
- ⚠️**Monster cards** - not yet implemented


## Getting Started

1. **Clone** this repository.  
2. **Clone** the [`2024_MPMBs-Character-Record-Sheet`](https://github.com/morepurplemorebetter/2024_MPMBs-Character-Record-Sheet) repo **next to** this one (Both repos in the same parent folder).  
3. **Copy** `etc/config.example.js` → `etc/config.js`.  
4. **Edit** your `config.js` file:  
   - Add URLs for any plugin scripts you want to use.  
   - Specify which cards you want displayed. (All spells, All known spells, All prepared spells, etc.)
5. **Open** `public/index.html` in your browser.

## Character Stats
not yet implemented

## Spell Cards

Cards are arranged in a 3×3 grid per page.  
If a card doesn't fit, it's moved to a 2x2 overflow page to give it more room for its text.

*TODO: make this behavior customizable. * 
Another option would be to summarize the spell card. This would keep all cards a uniform size, fitting in the 3x3 grid layout. 
Requires research - `description` is too short and`descriptionFull` is too long.*

# Monster Cards
not yet implemented








