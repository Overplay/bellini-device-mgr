/**
 * OGAndroidReleaseController
 *
 * @description :: Server-side logic for managing Ogandroidreleases
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const noReleases = { majorRev: 0, minorRev: 0, filename: "" };

module.exports = {

	latest: function( req, res ){

        const allParams = req.allParams();
        const level = allParams.level || 'release';

	    OGAndroidRelease.find({ where: { releaseLevel: level }, sort: { majorRev: 0, minorRev: 0} })
            .then(function(releases){
                if (!releases || !releases.length){
                    return res.ok(noReleases)
                }

                return res.ok(releases[0]);
            })
            .catch(res.serverError);

	}

};

