# LLPdMgr

Playdate Manager - Auto update your Playdate's apps from Itch.io!

The one app that I see being missing from the Playdate landscape 
is some way to easily update your apps from Itch.io.

Itch.io has become the de-facto standard for distributing 
Playdate games and apps, since there was no provided way to 
accomplish this from Panic.  They have since released their
Catalog app, but it only includes their own curated games.

This LL-Playdate-Manager intends on filling the role that 
Catalog has, but for Itch.io games.

You provide your itch and sideload credentials to LLPdMgr,
and it will look at both sets of games. (For the sake
of brevity, I will refer to "apps, tools, and games" as 
just "games" in the documentation.  I know that you can
install non-games on the Playdate... I've written a few 
of them. All Itch.io content works the same as games.)

Last year had created a python version of the beginnings 
of this, but the APIs and screen scraped things have 
changed in the meantime, so it no longer works.  Rather
than upating that out-of-date not-quite-complete tool,
I thought it made sense to make this Electron-based 
portable app instead.

## Core Features / Roadmap

- Save itch and sideload credentials
- Log in to your itch account
- retrieve a list of all games in your library
- log in to your sideload account
- retrieve a list of all games in your sideload list (with images)
- correlate the two
- present this data in a way that makes sense (two list view type things?)
- Add games from your itch account to your sideload account
- Remove games from your sideload
- Check versions of both to find ones that need to be updated
- Quick update function that will just update any recently updated games
- Quick install function that will install any newly purchased games


## Future Features?

One section of functionality that I may provide in
the future is the ability to work directly with your
Playdate console, when it is attached to your computer.

Features that could be possible include:
- manage/backup/restore game save data 
- make duplicates of games so that you can have two sets of save data
- manage submenu/section content (like "Season 1" etc)
- maybe re-order items (if that becomes possible)
