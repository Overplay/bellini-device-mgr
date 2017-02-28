

## Setting up a cloud server

0. https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2
    - set up an ssh key for your account(s) so its easier to log into if you wish
    - if the ssh key login is not working, make sure that `~/.ssh` is set to 700 and `~/.ssh/authorized_keys` is set to 600 

1. run `sudo apt-get update`

2. run `sudo apt-get upgrade`

3. Make sure build-essential is installed
    - To check use `dpkg -s build-essential`
    - to install, use `apt-get`

4. Make sure Node is at a proper version
    - `Node -v`
        - as of 6/20/16, 4.4.5 is current
    - 'sudo npm install -g npm@latest'

5. Install n
    - this is for node version management
    - `sudo npm istall -g n`

6. Create asahi user and group
    - `sudo adduser asahi`
        - use adduser to ensure a home directory is created (it will be needed for pm2) 

7. Add yourself to the asahi group
    - `sudo usermod -a -G asahi USERNAME`


8. Clone asahi and auto-reload into /opt, where it will be served from.
    - `sudo git clone https://github.com/Overplay/asahi`


9. Change permissions to allow asahi user to run everything properly
    - `sudo chown/chgrp -R asahi asahi`

10. Set group permissions on asahi
    - `sudo chmod -R 775 asahi`

## Prepping the server

11. NGINX
    - `sudo add-apt-repository ppa:nginx/stable`
    - `sudo apt-get update`
    - `sudo apt-get install nginx`


    - ##### ONCE installed

        - create a text file in `/etc/nginx/sites-available` with the below

            `upstream sails_server {
                server 127.0.0.1:1337;
                keepalive 64;
             }


             server {
                listen          80;
                server_name     asahi;

                location / {
                    proxy_pass http://sails_server;
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host $host;
                    proxy_cache_bypass $http_upgrade;
                    error_page 502 /502.html;

                }

                location /502.html {
                    internal;
                    root /opt/asahi/views/errors;
                }


             }`

        - sym link this file (`ln -s`) into `/etc/nginx/sites-enabled and` `rm default`
        - `sudo nginx -s reload`

12. Install PM2 and set up Keymetrics
    - used `sudo npm install pm2 -g` (currently on 2.0.18)
        - `pm2 update`
    - set up keymetrics if desired (allows web view of pm2 processes)
        - on your keymetrics bucket, simply link by copy pasting the command at the bottom
        - https://app.keymetrics.io

13. update other asahi global dependencies
    - `sudo npm install -g sails`

    #### Everything should be run as asahi user from this point forward (unlesss otherwise noted) 

14. Setup the git repo
    - Add user `asahi`'s public key to your github for auto-pull
    - `cd asahi`
        - `git remote -v`
        - `git remote set-url origin git@github.com:Overplay/asahi.git`
            - (https://help.github.com/articles/changing-a-remote-s-url/)
   

15. Update node packages in  `asahi`
    - `cd` into directory then npm update 
    
16. Run bower update in /assets for uiapp to work
    - `npm install -g bower-npm-resolver`
    - `cd /assets && bower update`
    
17. Add the `local.js` and `waterlock.js` file to /config
    - vi and insert or whatever floats your boat!
    - also on /home/asahi/local.js on the current server
         - `cd /config && cp ~/local.js .`
    - SIDE NOTE: To ensure that the db and sessions are preserved during a restart,
        - In `config/models.js`, set migrate to `safe` for a production server or potentially `alter` for testing (could be dangerous)
        - In `config/session.js`,  uncomment mongo settings to enable 
        - Also, if pushing for production, do NOT leave local.js `wideOpen: true`


18. Start `asahi` application 
    - `git checkout BRANCH` if you're running something other than master! (make sure it has process.json in it)
        - bower and npm update after checking out new branches!
    - `pm2 start process.json` in /opt/asahi

19. Start `auto-reload-pm2`  (as asahi user) 
    - `pm2 install auto-reload-pm2`
        - it is on the npm registry and will install automatically!
    - NOTE: May need to be configured based on process name. look at the README
    - now works for multiple procs

20. Generate a Startup Script
    - `pm2 startup ubuntu`
    - run the command
    - `pm2 save` to save the processes

21. Checkout `http://104.131.145.36/` or whatever the server is and see how it looks!




-----------------
At this point, the app runs properly.
-----------------

