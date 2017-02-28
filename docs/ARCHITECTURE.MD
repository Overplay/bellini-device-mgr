HOW IT'S WIRED
--------------

1. Nearly all requests go through a Sails API Controller ( `api/controllers` ) even if the controller is not
tied to a model. Requests pass first through `config/router.js` where the controller is assigned to the route.
<br>
2. Blueprint routes are attached to `api/v2` and every Blueprint needs to go through a policy by the time we
get to production OR BE TURNED OFF. The Blueprint route security actually ends up also controlling the Angular
UI apps. The UI-Router block uses `resolves` before pages are called. If those resolves fail, then the page isn't
loaded. For example, trying to load an admin Blueprint resource by a non-admin will fail causing the page to not
be shown. Exactly what we want.
<br>
3. The EJS template engine is used. The UI is served from `views/ui`. There are 2 files in there: `uilayout.ejs` which
has 99% of code needed, and `uiapp.ejs` which is really just the ui-view in a bootstrap container. CSS and JS dependencies
are loaded through EJS includes from `views/partials`.
<br>
4. Nearly all URLs go through `policies/authDecorator.js` which add local vars for the EJS engine to use to see if
the user is authenticated, admin, etc. The templates use this to keep HTML from even getting into the client browser
that shouldn't be seen such as admin menus.
   
   
   
   
   
   
PASSWORD RESET FLOW
-------------------

1. Request goes to `auth/reset?email=someone@test.com`.
2. A token is generated inside `reset.js` inside waterlock-local-auth. The ResetToken model has a before and after
   create method that does the actual emailing. I don't think I would have done it this way, since it ties the reset
   method very tightly to the emailing. For example, what if you wanted to do an SMS method?
3. An email is sent with a link to `GET /auth/reset?token=xyzed`. This GET is handled in `lib/controllers/actions/reset.js`
   and it checks the token, then if the token is cool, and a redirect is set in `config/waterlock.js` a redirect happens
   to whatever URL is in there. It should be a page to deal with letting the user enter a new password. `res.session.resetToken`
   is set to the same token. 
4. A policy should be run to check the session token that gates access to a password rest page.


USER VALIDATION FLOW
--------------------
Create the user, get the auth and create a token then add it to the auth and the token creation will send an email.
An HTTP `GET` to `/auth/validate` will invoke the validation process. This is done by clicking the link from the email