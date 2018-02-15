export default function smartTitle() {
    return function ( listing ) {

        // Mitch to do: something needs to be done here to check if listing is defined.
        // I'm not sure what this does right now - need to look into it
        if ( listing ) {
            let title = listing.showName;

            if ( listing.team1 && listing.team2 ) {
                title = title + ": " + listing.team1 + " v " + listing.team2;
            }

            return title;
        }
    }
}