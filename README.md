# BELLINI Device Manager

All of the Bellini apps (Core, Device Manager, PGS) are based off improved versions of the original Asahi code.

Bellini-DM's role in life is to handle all OG devices:
* SocketIO communication paths
* Logging
* Serving of apps ( codename "Blueline" in the assets/blueline folder )
* Monitoring devices


Sails Structure Notes
---------------------

1. The usual Grunting of `assets` to `.tmp` is turned off. I like to really know how my stuff is going together and this
   is particularly important when using AngularJS. Assets is served directly as the root of the webserver.
   <br>
2. EJS templates are used as the "index.html" of SPA Angular apps. So for example, the UI is bult from `views/ui` by
    merging the uilayout.ejs with uiapp.ejs. These files use EJS includes to grab JS and CSS dependencies from `views/partials`.
    These dependencies live in `assets/**`. 
    <br>
3. Login, Logout and Password reset all have their own EJS templates in `views/users`.
    <br>
