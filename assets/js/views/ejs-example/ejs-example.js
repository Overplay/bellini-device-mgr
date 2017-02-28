/**
 * Created by mkahn on 4/5/16.
 */

var app = angular.module('ejsTemplateApp', ['ui.bootstrap']);

app.controller("ejsTemplateController", function($scope){
    
    $scope.fromAngular = "This came from AngularJS";

    $scope.tabs = [
        {
            "title":   "How to Use",
            "content": "All templates import AngularJS 1.5x (and common support libs) and Angular Material. This is done in layout.ejs. The corresponding JS code for" +
                       " a views template file is kept in the assets folder under js/views/[folder] by convention." +
                       " We are not using any of the fancy Grunt task crap to assemble pages automagically."
        },
        {
            "title":   "Routes and Policies on Templated Views",
            "content": "The routes for this view are defined in the EJSExampleController. Basically they just return a res.view for each route." +
                       " The policies are in config/policies.js"
        },
        {
            "title":    "About",
            "content":  "See EJSTemplateController.js, policies.js and views/ejs-example for all the code that does this!"
        }
    ];

    $scope.tabs.activeTab = "How to Use";



    
})